#!/usr/bin/env python3
import os
import json
import glob

# İngilizce anahtar kelimeleri Türkçe karşılıklarıyla eşleştir
key_mappings = {
    "symptom_onset": "semptom_baslangici",
    "onset_characteristics": "baslangic_ozellikleri", 
    "pain_characteristics": "agri_ozellikleri",
    "associated_symptoms": "eslik_eden_semptomlar",
    "medical_history": "tibbi_gecmis",
    "precipitating_factors": "tetikleyici_faktorler"
}

def fix_json_file(file_path):
    """JSON dosyasındaki İngilizce anahtarları Türkçe'ye çevir"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Her anahtar kelimeyi değiştir
        modified = False
        for eng_key, tr_key in key_mappings.items():
            old_pattern = f'"{eng_key}":'
            new_pattern = f'"{tr_key}":'
            if old_pattern in content:
                content = content.replace(old_pattern, new_pattern)
                modified = True
                print(f"{file_path}: {eng_key} -> {tr_key}")
        
        # Değişiklik varsa dosyayı kaydet
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {file_path} güncellendi")
        
    except Exception as e:
        print(f"❌ Hata {file_path}: {e}")

def main():
    # Triage klasöründeki tüm JSON dosyalarını bul
    json_files = glob.glob('/Users/furkanyilmaz/Desktop/ai-triage/corpus/triage/*.json')
    
    print(f"{len(json_files)} JSON dosyası bulundu")
    
    for json_file in json_files:
        fix_json_file(json_file)
    
    print("\nTüm dosyalar işlendi!")

if __name__ == "__main__":
    main()