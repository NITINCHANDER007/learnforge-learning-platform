import sqlite3
import os
import json
import shutil

local_app_data = os.environ.get('LOCALAPPDATA', '')
base_dir = os.path.join(local_app_data, 'Google', 'Chrome', 'User Data')
temp_dir = os.environ.get('TEMP', '')

all_results = {}

for folder in os.listdir(base_dir):
    cookie_file = os.path.join(base_dir, folder, 'Network', 'Cookies')
    if os.path.exists(cookie_file):
        temp_copy = os.path.join(temp_dir, f'cookies_{folder}.db')
        try:
            shutil.copy2(cookie_file, temp_copy)
            conn = sqlite3.connect(temp_copy)
            c = conn.cursor()
            c.execute("SELECT host_key, name, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%dev.to%'")
            rows = c.fetchall()
            if rows:
                all_results[folder] = [{'host': r[0], 'name': r[1], 'enc_hex': r[2]} for r in rows]
            conn.close()
            os.remove(temp_copy)
        except Exception as e:
            pass

print(json.dumps(all_results))
