console.log("Node kathuka porom....")

const express = require('express');
const app = express();
const {v4:uuidv4} = require('uuid');
const mongoose = require('mongoose');
app.use(express.json());
const PORT = 8000;


const mongourl = "mongodb+srv://tharana2023it:5FhDvCm0fWI8tUfN@backend.qp2kl.mongodb.net/test";

mongoose.connect(mongourl)
.then(() => {
    console.log("MongoDB connected");
    app.listen(PORT,()=>{
        console.log(`Server is running at http://localhost:${PORT}`);
    })
})
.catch((err) => {
    console.log(err);
})

const expenseSchema = new mongoose.Schema({
    id:{type:String , required:true,unique:true},
    title:{type:String,required:true},
    amount:{type:Number,required:true},
});

const expenseModel = mongoose.model("expense-tracker",expenseSchema);//collection_name,schema_name

app.post("/api/expense",async(req,res)=>{
    const { title, amount} = req.body;
    const newExpense = new expenseModel({
        id:uuidv4(),
        title:title,
        amount:amount,
    });
    const savedExpense = await newExpense.save();
    res.status(200).json(savedExpense);
});

app.get("/api/expense",async(req,res)=>{
    const expenses = await expenseModel.find();
    res.status(200).json(expenses);
})

app.get("/api/expense/:id",async(req,res)=>{
    const {id} = req.params;
    const expense = await expenseModel.findOne({id});
    res.status(200).json(expense);
})

app.put("/api/expense/:id",async(req,res)=>{
    const {id} = req.params;
    const {title,amount} = req.body;
    const updated = await expenseModel.findOneAndUpdate(
        {
            id:id,
        },
        {
            title:title,
            amount:amount,
        }
    );
    res.status(200).json(updated);
} );

app.delete("/api/expense/:id",async(req,res)=>{
    const {id} = req.params;
    const deleted = await expenseModel.findOneAndDelete({id});
    res.status(200).json(deleted);
})

