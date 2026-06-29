const express = require("express")
const fs = require("fs")
const PORT = 3000

const app = express()
app.use(express.json())
app.get("/user", (req,res) => {
    fs.readFile("users.json", "utf-8", (err,data) => {
        if(err){
            return res.status(500).json("An error occured")
        }
        const users = JSON.parse(data)
        return res.status(200).json(users)

    })
})
app.get("/user/getByName", (req,res) => {
    const { name } = req.query
    fs.readFile("users.json", "utf-8", (err,data) => {
        if(err){
            res.statusCode = 500
            return res.send("An error occured")
        }
        const users = JSON.parse(data)
        const user = users.find(u => u.name === name)
        if(!user){
            res.statusCode = 404
            return res.send(JSON.stringify({message:"This user doesn't exist"}))
        }

        return res.status(200).json(user)
    })
})
app.get("/user/filter", (req,res) => {
    const age = Number(req.query.age)

    fs.readFile("users.json", "utf-8", (err,data) => {
        if(err){
            return res.status(500).json("An error occured")
        }

        const users = JSON.parse(data)
        const filteredUsers = users.filter(u => u.age >= age)

        return res.status(200).json(filteredUsers)
    })
})
app.get("/user/:id", (req,res) => {
    const id = Number(req.params.id)
    fs.readFile("users.json", "utf-8", (err,data) => {
        if(err){
            return res.status(500).json("An error occured")
        }
        const users = JSON.parse(data)
        const exist = users.find(u => u.id === id)
        if(!exist){
            return res.status(404).json("This user doesn't exist")
        }
        return res.status(200).json(exist)
    })
})
app.post("/user", (req,res) => {
    const newUser = req.body
    fs.readFile("users.json", "utf-8", (err,data) => {
        if(err){
            return res.status(500).json("An error occured")
        }
        const users = JSON.parse(data)
        const exists = users.find(u => u.email === newUser.email)
        if(exists){
            return res.status(409).json("Email already exists")
        }
        users.push(newUser)
        fs.writeFile("users.json", JSON.stringify(users,null,2), (err) => {
            if(err){
                return res.status(500).json("An error occured")
            }
            return res.status(201).json({
                message:"User added",
                user:newUser
            })
        })
    })
})
app.delete("/user/:id", (req,res) => {
    const id = Number(req.params.id)
    fs.readFile("users.json", "utf-8", (err,data) => {
        if(err){
            return res.status(500).json("An error occured")
        }
        const users = JSON.parse(data)
        const index = users.findIndex(u => u.id === id)
        if(index === -1){
            return res.status(404).json("This id doesn't exist")
        }
        const deletedUser = users[index]
        users.splice(index, 1)
        fs.writeFile("users.json", 
            JSON.stringify(users,null,2),
            "utf-8",
            (err) => {
                if(err){
                    return res.status(500).json("An error occured")
                }
                return res.status(200).json({message:"This user has been deleted", user: deletedUser})
            }
           
        )
    })
})
app.patch("/user/:id", (req,res) => {
    const id = Number(req.params.id)
    const editedUser = req.body

    fs.readFile("users.json", "utf-8", (err,data) => {
        if(err){
            return res.status(500).json("An error occured")
        }

        const users = JSON.parse(data)
        const index = users.findIndex(u => u.id === id)
        if(index === -1){
            return res.status(404).json("This user doesn't exist")
        }

        users[index] = {
            ...users[index],
            ...editedUser
        }
        fs.writeFile("users.json", 
            JSON.stringify(users,null,2),
            err => {
                if(err){
                    return res.status(500).json("An error occured")
                }
                res.status(200).json({
                    message:"This user has been edited",
                    user:users[index]
                })
            }
        )

    })
})


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))