# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  config.vm.provider :vmware do |vm_ware|
  #   # Don't boot with headless mode
  #   vb.gui = true
  #
  #   # Use VBoxManage to customize the VM. For example to change memory:
    config.vm.box = "ubuntu/trusty64"
  end

  config.vm.network :forwarded_port, guest: 5432, host: 5432
  
  config.ssh.forward_agent = true

  config.vm.synced_folder ".", "/vagrant"

  config.vm.provision "shell", path: "provision/locale.sh"
  config.vm.provision "shell", path: "provision/pg.sh"
end
