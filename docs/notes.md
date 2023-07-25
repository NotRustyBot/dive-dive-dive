


## Network

### Sync

The sync component handles serialisation and de-serialisation of objects and their components.  

#### flow
* string `identity` is used to identify the environment, clients / server (server's identity is `server`, clients have random base64 string)
* BaseObject is created, components are assigned. One of the components is Sync.
* Use the `authorise` method to give specific environment authority over the individual components.  
note: server will serialise all the components of the object, when the object is being sent for a first time to the specific client.
* Sync keeps track of the clients when serialising the data, comparing last serialised cacheId to the current one