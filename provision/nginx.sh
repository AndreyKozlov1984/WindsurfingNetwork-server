set -e
mkdir -p /var/log/nginx
cat << "LOGROTATE" > /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    rotate 7
    size 50000k
    dateext
    dateformat -%Y-%m-%d
    notifempty
    missingok
    compress
    sharedscripts
    postrotate
        test -r /var/run/nginx.pid && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
LOGROTATE
if [ ! -f /usr/local/openresty-1.7.10.1-installed ]; then
    service nginx stop || true
    echo 'setting up nginx'
    apt-get -y install libreadline-dev libncurses5-dev libpcre3-dev libssl-dev perl make
    cd /tmp
    wget http://openresty.org/download/ngx_openresty-1.7.10.1.tar.gz
    tar xzvf ngx_openresty-1.7.10.1.tar.gz
    cd ngx_openresty-1.7.10.1/
    ./configure --with-http_postgres_module
    make
    make install
    rm /usr/local/openresty/nginx/conf/nginx.conf
    ln -s  /vagrant/config/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
    touch /usr/local/openresty-1.7.10.1-installed
fi
