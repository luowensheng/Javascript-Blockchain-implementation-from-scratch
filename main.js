function getRandomNumber(end, start=0){
    return Math.floor((Math.random()*(end-start)+start))
}

class Block {
    
    get variables(){
        return 'qwertyuiopasdfghjklzxcvbnm1234567890'
    }

    get blockLength(){
        return 40
    }

    update(data){
        this.data = data
        this.hash = this.generateHash()
    }

    constructor(data, prevBlockHash){
        this.data = data
        this.prevBlockHash = prevBlockHash
        this.hash = this.generateHash()
    }

    generateHash(){
        var hash = ""
        for(let i=0; i< this.blockLength; i++){
            const index = getRandomNumber(this.variables.length)
            hash+= this.variables[index]
        }
        return hash

    }

    toString(){
        return {data: this.data, hash: this.hash, prevBlockHash: this.prevBlockHash}
    }

}

class BlockChain {

    constructor(){
        this.blocks = []
    }

    getBlock(i){
        return this.blocks[i]
    }

    add(data){
        if (!this.doProofOfWorkOk()){
            throw new Error("Proof of Work Failed!!! Invalid Transaction! Block has been corrupted")
        }
        let block = this.generateBlock(data)
        this.blocks.push(block)
    }

    generateBlock(data){
        return new Block(data, this.getPreviousHash() );
    }

    doProofOfWorkOk(){
        for (let i=0; i<this.length-1; i++){
            let block = this.blocks[i]
            let nextBlock = this.blocks[i+1]

            if(block.hash!=nextBlock.prevBlockHash){
                return false
            }
        }

        return true;
    }

    get length(){
        return this.blocks.length
    }

    toString(){
        let result = ""
        for(let i=0; i<this.blocks.length; i++){
            result+=this.blocks[i].data.toString()+"\n"
        }

        return result;
    }

    getPreviousHash(){
        let lastIndex = this.length - 1
        if (lastIndex==-1){
            return null
        } 
        else {
            return this.blocks[lastIndex].hash
        }

    }
}

class Transaction {
     constructor(from, to, amount){
         this.from = from
         this.amount = amount
         this.to = to
     }

    toString(){
        return {from: this.from, amount: this.amount, to: this.to}
    } 
}

class User {
    
    constructor(name, id, blockChain, onRequestTransaction, balance=0){

        this.name = name
        this.balance = balance
        this.id = id
        this.blockChain = blockChain
        this.onRequestTransaction = onRequestTransaction
        
    }

    receive(amount){
          this.balance+= amount
    }

    send(amount, from){
       let transaction = new Transaction(from, this.id, amount) 
       let successful = this.onRequestTransaction(transaction)
       if (successful)
          this.balance -= amount
    }

    checkBalance(){
          return this.balance
    }
}

class P2PNetwork {
    constructor() {
        this.blockChain = new BlockChain()
        this.users = []
    }

    addUser(name){
       let id = this.users.length
        const {users, blockChain} = this;
        const onRequestTransaction = (transaction)=>{

                for (let i=0; i <users; i+=1){
                    let user = users[i]
                    if(!user.blockChain.doProofOfWorkOk()){
                        throw new Error("Proof of work Failed !!");
                    }
                }
                if(!blockChain.doProofOfWorkOk()) throw new Error("Proof of work Failed !!");
        
        
                for (let i=0; i <users; i++){
                    let user = users[i]
                      user.blockChain.add(transaction)
                }
                blockChain.add(transaction)
                users[transaction.to].receive(transaction.amount)
        
                return true;
        }
        
        this.users.push(new User(name, id, this.blockChain, onRequestTransaction))
    }
}


function getData(){
    return getRandomNumber(100)
}

function generateName(){
    let letters = 'qwertyuiopasdfghjklzxcvbnm'
    let n = getRandomNumber(12, 3)
    var name = ''
    for(let i =0; i<n; i++){
       index = getRandomNumber(letters.length) 
       name+=letters[index]
    }

    return name

}


const bitcoin = new P2PNetwork()

for(let i=0; i<10; i++){
    let name = generateName()
    bitcoin.addUser(name)
}

const getNRandomUsers = (n=2)=>{
    let users = []
    for(let i = 0; i<n; i++){
        let index = getRandomNumber(bitcoin.users.length)
        users.push( bitcoin.users[index])
    }
    return users
}

for (let i=0; i< 1000; i++){
    let users = getNRandomUsers(2)
    let amount = getRandomNumber(1000, 100)
    
    if ((i %20==0)&&(i>20)) // this should cause an error because blocks cannot be modified
    {
        users[0].blockChain.getBlock(1).update(5)
    }
    users[0].send(amount, users[1].id)
    console.log(`${users[0].name} sent ${amount} to ${users[1].name}`)
}


