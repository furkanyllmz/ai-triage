from database import SessionLocal
from models import Triage

db = SessionLocal()
try:
    tri = Triage(
        case_id='test123',
        age=30,
        sex='erkek',
        complaint_text='test',
        vitals={},
        triage_level='ESI-4',
        rationale='test',
        red_flags=[],
        immediate_actions=[],
        questions_to_ask_next=[],
        routing={},
        evidence_ids=[]
    )
    db.add(tri)
    db.commit()
    print('Manual insert successful')
except Exception as e:
    print(f'Error: {e}')
    db.rollback()
finally:
    db.close()