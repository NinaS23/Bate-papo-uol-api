import express , {json} from "express"
import cors from "cors"
import chalk from "chalk"

const PORT = 5000
const app = express()
app.use(cors())
app.use(json())



app.listen(PORT , ()=>{
    console.log("wake")
})