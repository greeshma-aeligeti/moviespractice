const express=require('express')
const path=require('path')

const {open}=require('sqlite')
const sqlite3=require('sqlite3')

const app=express()
app.use(express.json())

const dbPath=path.join(__dirname,'moviesData.db')

let db=null;
const initializeDb= async ()=>{
    try{
        db= await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(3002,()=>{
            console.log("Server started")
        })
    }
    catch(e){
        console.log("Error");
        process.exit(1);
    }
}
initializeDb();

app.get('/movies', async (request,response)=>{
    const query=`
    select movie_name from movie;
    `;
    const res= await db.all(query);
    response.send(res.map((eachMovie)=>convertList(eachMovie)));
})

app.post('/movies/', async (request,response)=>{
    const movieDetails=request.body;
    const {directorId,movieName,leadActor}=movieDetails;
    const query=`
    insert into movie(director_id,movie_name,lead_actor)
    values(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );
    `;
    const result=await db.run(query);
    response.send("Movie Successfully Added");
} )
const convertList=(eachMovie)=>{
    return {
        movieId:eachMovie.movie_id,
        directorId:eachMovie.director_id,
        movieName:eachMovie.movie_name,
leadActor:eachMovie.lead_actor,        
    }
}
app.get('/movies/:movieId/', async (request,response)=>{
    const {movieId}=request.params;
    const query=`
    select * from movie where movie_id = ${movieId};
    `;
    const res=await db.get(query);
    response.send(res);
})

app.put('/movies/:movieId', async (request,response)=>{
    const {movieId}=request.params;
    const movieDetails=request.body;
const {directorId,movieName,leadActor}=movieDetails;
const query=`
update movie
set
director_id=${directorId},
movie_name='${movieName}',
lead_actor='${leadActor}'
where movie_id=${movieId};
`    ;
const res= await db.run(query);
response.send("Movie Details Updated");
});

app.delete('/movies/:movieId', async (request,response)=>{
const {movieId}    =request.params;
const query=`
delete from movie where movie_id=${movieId};`;
const res= await db.run(query);
response.send("Movie Removed");
})

app.get('/directors/', async (request,response)=>{
    const query=`
    select * from director;
    `;
    const res=await db.all(query);
    response.send(res);
})

app.get('/directors/:directorId/movies/', async (request,response)=>{
    const {directorId}=request.params;
    const query=`
    select movie_name from movie where director_id=${directorId};
    `;
const res=await db.all(query);
    
response.send(res);
})

module.exports=app;