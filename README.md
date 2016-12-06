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

Create MongoDB service for flow-proxy:

```
node1$ docker service create --name flow-mongo --network proxy mongo:2.6.5
```

```
node1$ docker service create \
    --name flow-proxy \
    --network proxy \
    --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
    --publish 80:80 \
    --publish 443:443 \
    --publish 8080:8080 \
    --env NET_PROXY=proxy \
    --env NET_APP=appnet \
    --env MONGO_HOST=flow-mongo \
    flow-proxy
```

## How to test

Create new instance by issuing a POST request:

```
curl -H "Content-Type: application/json" -X POST -d '{"requestId":"anything","requesterEmail":"your@email","domainName":"openpaas"}' '127.0.0.1:8080/api/deployments'
```
You will receive instance's address and account for admin, you have to note this account for login to instance.

Take a coffee and enjoy the new instance created:

```
curl --header 'Host: http://linagora.beta.data.gouv.fr' http://127.0.0.1
```

Remove instance by send a POST request:

```
curl -XPOST '127.0.0.1:8080/api/deployments/remove?domain=linagora'
```

## To update flow-proxy

Rebuild the flow-proxy image:

```
node1$ docker build -t flow-proxy .
```

Tell Docker Swarm to update the flow-proxy service with the name image:

```
node1$ docker service update --image flow-proxy:latest flow-proxy
```
