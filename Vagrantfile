# -*- mode: ruby -*-
# vi: set ft=ruby :
# vagrant-hosts-provisioner (2.0)
# vagrant-libvirt (0.0.33)

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
    config.vm.box = "ubuntu/trusty64"
    config.vm.provision "shell", inline: <<-SHELL
	  if [ ! -f /usr/bin/docker ]; then
		  # install docker
		  sudo apt-get install -y whois git unzip wget curl
		  sudo wget -nv -O - https://get.docker.com/ | sh
	  fi
    SHELL
	config.vm.synced_folder ".", "/vagrant", type: "nfs"

    config.vm.define :node1 do |node1|
      node1.vm.provider :libvirt do |domain|
         domain.memory = 2048
         domain.cpus = 2
         domain.nested = true
         domain.volume_cache = 'none'
      end
	  node1.vm.provision :hostsupdate do |provision|
	     provision.hostname = 'warmnode1.dev'
         provision.manage_host = true
  	  end
    end

    config.vm.define :node2 do |node2|
      node2.vm.provider :libvirt do |domain|
         domain.memory = 2048
         domain.cpus = 2
         domain.nested = true
         domain.volume_cache = 'none'
      end
	  node2.vm.provision :hostsupdate do |provision|
	     provision.hostname = 'warmnode2.dev'
         provision.manage_host = true
  	  end
    end
end

