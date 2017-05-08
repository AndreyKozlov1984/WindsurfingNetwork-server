#deploys the current code to the server
#requires your ssh key, so run it directly from your mac, not from the vagrant
export SERVER='vagrant@107.170.69.116'
echo "This deploys the APP to the $SERVER"
[ -z "$SERVER" ] && exit
rm -rf dist
./node_modules/.bin/babel src -d compiled
scp provision/* $SERVER:/tmp
ssh $SERVER <<"ENDSSH"
    sudo bash -l /tmp/mount-vagrant.sh
    sudo bash -l /tmp/locale.sh
    sudo bash -l /tmp/pg_prod.sh
    sudo bash -l /tmp/nginx.sh
    sudo bash -l /tmp/node.sh
    sudo bash -l /tmp/swap.sh
ENDSSH

ssh $SERVER 'sudo service nginx stop'
ssh $SERVER 'pm2 stop server'

ssh $SERVER <<ENDSSH
    sudo cp /vagrant/config/nginx.service /lib/systemd/system/nginx.service
    sudo systemctl daemon-reload
    sudo service nginx start
ENDSSH


rsync --delete -rav -e ssh \
    --exclude='dist' \
    --exclude='*.git' \
    --exclude=".vagrant" \
    --exclude="node_modules" \
    . $SERVER:/vagrant

ssh $SERVER <<"ENDSSH"
    sudo chmod -R 755 /vagrant
ENDSSH


ssh $SERVER <<"ENDSSH"
    cd /vagrant/
    yarn install  --production
    node ./node_modules/.bin/knex migrate:latest
ENDSSH

ssh $SERVER 'cd /vagrant; pm2 start compiled/server.js'

pushd ../webapp;
yarn deploy:prod
rsync --delete -rav -e ssh \
    dist $SERVER:/vagrant
popd
