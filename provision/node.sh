set -e
which nave || (
    sudo apt-get update
    sudo apt-get -y install curl
    curl -L https://raw.github.com/isaacs/nave/master/nave.sh | sudo tee /usr/bin/nave
    sudo chmod +x /usr/bin/nave
    sudo chown -R vagrant:vagrant /home/vagrant/.nave
    sudo chown -R vagrant:vagrant /home/vagrant/.npm
)
sudo nave usemain 7.6.0
which yarn || npm install -g yarn
which pm2 || npm install -g pm2
which python || sudo apt-get -y install python
which g++ || sudo apt-get -y install build-essential g++
