"""File upload endpoint: accepts CSV/Excel/PDF, parses, stores transactions."""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.transaction import Transaction
from app.models.upload import FileType, UploadStatus, UploadedFile
from app.models.user import User
from app.services import statement_parser
from app.models.notification import Notification, NotificationType
from app.models.budget import Budget
router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls", "pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("")
async def upload_statement(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    file_type_map = {
        "csv": FileType.csv,
        "xlsx": FileType.excel,
        "xls": FileType.excel,
        "pdf": FileType.pdf,
    }

    upload_record = UploadedFile(
        user_id=user.id,
        filename=file.filename,
        file_type=file_type_map[ext],
        file_size=len(content),
        s3_key=f"uploads/{user.id}/{file.filename}",
        status=UploadStatus.processing,
    )

    db.add(upload_record)
    await db.flush()

    try:
        rows = statement_parser.parse_statement(file.filename, content)
    except Exception as e:
        upload_record.status = UploadStatus.failed
        upload_record.error_message = str(e)
        await db.commit()
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}")

    transactions = []

    for row in rows:
        tx = Transaction(
            user_id=user.id,
            source_upload_id=upload_record.id,
            **{
                k: v
                for k, v in row.items()
                if k in Transaction.__table__.columns.keys()
            },
        )
        transactions.append(tx)
        db.add(tx)

    upload_record.status = UploadStatus.completed
    upload_record.transaction_count = len(transactions)

    notification = Notification(
        user_id=user.id,
       type=NotificationType.high_spending,
        title="Statement Imported",
        message=f"Successfully imported {len(transactions)} transactions.",
    )

    db.add(notification)

        # Check budget usage
    budget_result = await db.execute(
    select(Budget).where(Budget.user_id == user.id)
        )

    budgets = budget_result.scalars().all()

    for budget in budgets:
        spent_result = await db.execute(
        select(func.sum(Transaction.amount)).where(
            Transaction.user_id == user.id,
            Transaction.type == "expense",
            Transaction.category == budget.category,
        )
    )

    spent = spent_result.scalar() or 0

    if spent >= budget.amount * 0.9:
        db.add(
            Notification(
                user_id=user.id,
                type=NotificationType.budget_exceeded,
                title="Budget Alert",
                message=(
                    f"You've spent ₹{spent:,.2f} "
                    f"of your ₹{budget.amount:,.2f} "
                    f"{budget.category} budget."
                ),
            )
        )

    await db.commit()

    return {
        "upload_id": str(upload_record.id),
        "filename": file.filename,
        "transactions_imported": len(transactions),
        "status": "completed",
    }