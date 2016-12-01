# Flow-proxy

## How to build and run

### Create 2 VM  

We will setup 2 swarm node. Vagrant will auto setup by provision.

```
vagrant up
```

### Setup swarm cluster
```
node1$ swarm init
node2$ docker swarm join --token <SWMTKN-TOKEN>  <x.x.x.x:xx>
```

### Run Flow-proxy services
All command is typed by node1 (Manager)

- Create 2 new network with driver overlay

```
node1$ docker network  create --driver overlay proxy
```
```
node1$ docker network  create --driver overlay appnet
```

- Build Flow-proxy and run

```
node1$ docker build -t flow-proxy .
```
```
node1$ docker service create \
	  --name flow-proxy \
		--network proxy \
		--mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
		--publish 80:80 \
		--publish 8080:8080 \
		--env NET_PROXY=proxy \
		--env NET_APP=appnet \
		flow-proxy
```

## How to test

Create new instance by issuing a POST request:

```
curl -XPOST '127.0.0.1:8080/api/deployments?requestId=anything&domain=linagora.com'
```

Take a coffee and enjoy the new instance created:

```
curl --header 'Host: http://linagora.com' http://127.0.0.1
```
