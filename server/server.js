const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
const sqlite = require('sqlite3').verbose();

app.use(cors());

const db = new sqlite.Database("./server/bookreviewer.db", (err) => { 
    if (err) { 
        console.error('Error al conectar:', err.message); 
    } 
    else { 
        console.log('Conectado!'); 
}})

function runQuery(query){
    return new Promise((resolve, reject)=>{
        db.all(query, [], (err, rows)=>{
            if(err){
                return reject;
            }
            resolve(rows)
        })
    })
}

app.get("/api/home", async (req, res) => {
  const topUsersQuery = `
            select u.id, u.username, u.avatar, u.user_description as "userDescription", count(r.id) as review_count from users u join reviews r on r.user=u.id 
            group by u.id order by review_count desc
            limit 3;
        `
  const reviewsQuery = `
            select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId", u.username as "reviewerName", b.cover as "image"
            from reviews r join books b on r.book=b.id join users u on u.id=r.user
            order by b.year desc; 
        `
  const topBooksQuery = `select b.id, b.title, b.cover as "image", b.author, b.year, 
            count(r.id) as "review_count"
            from books b join reviews r on b.id=r.book
            group by b.id order by review_count
            limit 3;
       `
   try{

       const [usr, rev, bk] = await Promise.all([
           runQuery(topUsersQuery),
           runQuery(reviewsQuery),
           runQuery(topBooksQuery)
        ])
        const result = {
            topUsers: usr,
            reviews: rev,
            topBooks: bk
        }
        res.json(result)
    }
    catch(err){
        res.json({error: "failed to load"})
    }
});

app.get("/", (req, res)=>{
    db.all("select * from reviews", [], (err, rows)=>{
        if(err){
            console.error(err.message)
        }
        res.json(rows);
    });
})

app.get('/api/review/:id', async(req, res) => {
  try{
    const revId = parseInt(req.params.id.toString())
    const result = await runQuery(`
        select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId",
        u.username as "reviewerName", b.cover as "image"
        from reviews r join books b on r.book=b.id join users u on u.id=r.user
        where r.id=${revId};
        `)
    if(result.length == 0) throw new Error("no review found")
    res.json(result[0])
  }
  catch(err){
    res.json(err)
  }
});

app.get('/api/user/:id', async(req, res) => {
    try{
        const usrId = parseInt(req.params.id.toString())
        const [usr, usrRevs] = await Promise.all([
            runQuery(`
            select u.id, u.username, u.avatar, u.user_description as "userDescription" from users u
            where u.id = ${usrId}
            `),
            runQuery(`
            select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId",
            u.username as "reviewerName", b.cover as "image"
            from reviews r join books b on r.book=b.id join users u on u.id=r.user
            where u.id=${usrId};
            `)
        ])
        const result = {
            userReviews: usrRevs, ...usr[0]
        }
        if(result.length == 0) throw new Error("no usr found")
        res.json(result)
      }
      catch(err){
        res.json(err)
      }
});

app.get('/api/book/:id', async(req, res) => {
    try{
        const bookId = parseInt(req.params.id.toString())
        const [book, bookRevs] = await Promise.all([
            runQuery(`
            select b.id, b.title, b.cover as "image", b.author, b.year
            from books b where b.id = ${bookId}
            `),
            runQuery(`
            select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId",
            u.username as "reviewerName", b.cover as "image"
            from reviews r join books b on r.book=b.id join users u on u.id=r.user
            where b.id=${bookId};
            `)
        ])
        const result = {
            reviews: bookRevs, ...book[0]
        }
        if(result.length == 0) throw new Error("no book found")
        res.json(result)
      }
      catch(err){
        res.json(err)
      }
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  notes.push(newNote);
  res.status(201).json(newNote);
});

process.on('SIGINT', () => {
     db.close((err) => {
         if (err) { 
            console.error('Error al cerrar:', err.message); 
        } 
        else { 
            console.log('Cerrada!'); 
        } 
        process.exit(0); 
    }); 
});

app.listen(port, ()=>{
    console.log("bookreviewer api runing on port " + port)
})