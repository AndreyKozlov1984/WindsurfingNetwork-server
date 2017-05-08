export SERVER='vagrant@107.170.69.116'
vagrant ssh -- pg_dump -h 127.0.0.1 main --format=c --file=/vagrant/dump
scp dump $SERVER:/tmp/dump
ssh $SERVER <<"ENDSSH"
    pm2 stop server
    dropdb main
    createdb main
    pg_restore -d main /tmp/dump
    pm2 start server
ENDSSH
