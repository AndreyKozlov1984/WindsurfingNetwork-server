#bootstraps server so you can then work via dev_server_deploy.bash
#a one time stuff
#requires your ssh key, so run it directly from your mac, not from the vagrant
SERVER='root@107.170.69.116'
DEPLOY='vagrant'
ssh $SERVER <<ENDSSH
id $DEPLOY 2> /dev/null | grep sudo || useradd $DEPLOY -m -G sudo
mkdir -p /home/$DEPLOY/.ssh
echo '$(<provision/authorized_keys)' >> /home/$DEPLOY/.ssh/authorized_keys
chown -R $DEPLOY:$DEPLOY /home/$DEPLOY
echo '$DEPLOY ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
chsh -s /bin/bash $DEPLOY

ENDSSH
