from database import engine, Base
from sqlalchemy import text

# Tüm tabloları CASCADE ile sil
with engine.connect() as conn:
    conn.execute(text('DROP SCHEMA public CASCADE'))
    conn.execute(text('CREATE SCHEMA public'))
    conn.commit()

# Tabloları yeniden oluştur
Base.metadata.create_all(bind=engine)
print('Tablolar CASCADE ile yeniden oluşturuldu!')