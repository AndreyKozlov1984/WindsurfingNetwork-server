set -e
install_postgres () {

echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get -y install wget ca-certificates
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |  apt-key add - 
    
apt-get update
apt-get -y install \
    postgresql-9.6 \
    postgresql-server-dev-9.6 \
    postgresql-contrib-9.6 \
    libpq-dev

cat <<- EOF > /etc/postgresql/9.6/main/pg_hba.conf
    host    all             all             all                trust
EOF
cat <<- EOF >> /etc/postgresql/9.6/main/postgresql.conf
  listen_addresses = '*'
EOF
chown postgres:postgres /etc/postgresql/9.6/main/pg_hba.conf
chown postgres:postgres /etc/postgresql/9.6/main/postgresql.conf
sudo -u postgres createuser vagrant -s || echo 'user exists'
sudo -u postgres bash -l -c 'psql -l | grep main || createdb main encoding=UTF8'

}
if [ ! -f /usr/lib/postgresql/9.6/bin/postgres ]; then
    install_postgres
fi

service postgresql restart

