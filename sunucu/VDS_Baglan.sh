#!/bin/bash
echo "Oracle Cloud VDS'e (79.72.47.23) bağlanılıyor..."
# Anahtar dosyasının izinlerini garantiye al
chmod 600 /home/soner/Masaüstü/ssh-key-2025-12-18.key
# Bağlan
ssh -i /home/soner/Masaüstü/ssh-key-2025-12-18.key ubuntu@79.72.47.23
