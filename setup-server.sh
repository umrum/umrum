if hash node 2>/dev/null; then
  echo "nodejs already installed"
else
  # Prepare sourcelist and update apt-get
  curl -sL https://deb.nodesource.com/setup | sudo bash -

  # Install nodejs
  sudo apt-get install -y nodejs

  # Enable node to bind port 80
  sudo setcap "cap_net_bind_service=+ep" /usr/bin/nodejs
fi

if hash npm 2>/dev/null; then
  echo "npm already installed"
else
  # Install npm
  sudo apt-get install -y npm
fi

if hash pm2 2>/dev/null; then
  echo "pm2 already installed"
else
  # Install pm2
  sudo npm install -g pm2
  sudo pm2 startup ubuntu
fi

if hash git 2>/dev/null; then
  echo "git already installed"
else
  # Install git
  sudo apt-get install -y git
fi

# Install Redis
if hash redis-server 2>/dev/null; then
  echo "redis already installed"
else
  ## requirements
  sudo apt-get install -y build-essential tcl8.5
  ## check for latest version
  redis_version="2.8.17"
  redis_fname="redis-${redis_version}"
  cd /opt
  sudo wget http://download.redis.io/releases/${redis_fname}.tar.gz
  tar xzf redis-${redis_version}.tar.gz
  cd redis-${redis_version}
  make && make test
  sudo make install
  cd utils && sudo ./install_server.sh
fi
