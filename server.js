const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');
const uuidv4 = require('uuid');


const psg = knex({
  client: 'postgres',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'BulletWar1@',
    database : 'test'
  }
});

//psg('person').insert({first_name: 'kelly', last_name: 'Rodriguez', gender: 'Male'}).then(console.log());

//psg.select('first_name').from('person').then(data => console.log(data));

const PAT = '0a731558d9fd4cd6ac28e0de00bf2473';
const USER_ID = 'clarifai';       
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    
const IMAGE_URL = '';


const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
	users:[
		{
			id: '123',
			name: 'John',
			email: 'john@gmail.com',
			
			entries: 0,
			joined: new Date(),
		},
		{
			id: '124',
			name: 'Clau',
			email: 'clau@gmail.com',
			
			entries: 0,
			joined: new Date(),
		},
		{
			id: '125',
			name: 'tom',
			email: 'tom@gmail.com',
			
			entries: 0,
			joined: new Date(),
		},
		{
			id: '126',
			name: 'mike',
			email: 'mike@gmail.com',
			password: '126',
			entries: 0,
			joined: new Date(),
		}
	],
	loginH:[{
		id:'900',
		hash:'',
		email:'john@gmail.com',
	}],
}

app.use((req, res, next) => {
	console.log('inheritance');
	next();
});


app.get('/', (req, res) =>{
	res.send(database.users[0]);
});

//------------Sign In---------------

app.post('/signin', (req, res) =>{
	console.log('cuba')
	const {email, password} = req.body;

	psg('users')
	.returning('*')
	.where ('email', email)
	.then(response => {res.json(response[0].id)})
	/*let pp = database.users.find((e)=>{return req.body.email === e.email});
	const hash = database.loginH.find((e)=>{return req.body.email === e.email});
	let result = false;

	if(pp && hash){
		result = bcrypt.compareSync(req.body.password, hash.hash);
		//bcrypt.compareSync(someOtherPlaintextPassword, hash);
	}
	if(result) res.json('success');
	else res.json('horrible');*/
	})

//------------Register--------------

app.post('/register', (req, res) => {

	console.log(req.body)
	const {name, email, password} = req.body;

	psg('users')
	.returning('*')
	.insert({name: name, email: email, img_entrance: 0, id: uuidv4.v4()})
	.then(response => {res.json(response[0].email)})
	.catch(err => res.status(400).json('error'));

	//psg.select('name').from('users').then(data => console.log(data));

	
	//const salt = bcrypt.genSaltSync(10);
	//const hashC = bcrypt.hashSync(password, salt);

	/*let passUser = {
		id: parseInt(database.loginH[Math.abs(database.loginH.length-1)].id) + 1,
		hash: hashC,
		email: email,
	}
	
	console.log('club')
	let user = {
		id: parseInt(database.users[database.users.length-1].id) + 1,
		name: name,
		email: email,
		entries: 0,
		joined: new Date(),
	};*/

	//database.loginH.push(passUser);
	//database.users.push(user);
	//res.json('success');
})

//----------Get Profile--------------

app.get('/profile/:id',(req, res) => {
	const {id} = req.params;
	let pp = database.users.find((e) => {
		return e.id === id;
	})
	/*let hashpp = database.login.find((e) => {
		return e.email === pp.email;
	})*/
	//console.log(hashpp);
	if(pp) res.json(pp);
	else res.status(400).json('terrible')
})


//----------Update entries Images----

app.put('/image',(req,res) => {
	const {id} = req.body;
	let pp = database.users.find((e) => {
		return e.id === id;
	})
	if(pp){
		pp.entries++;
		res.json(pp);
	}else{
		res.status(400).json('horrible')
	}
})


//----------ImagenAPI----------------

app.post('/imagenClarifai',(req,res) => {

	const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": req.body.url
                    }
                }
            }
        ]
    });
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };
    
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.json())
        //.then(r => res.json(r))
        .then(resp => {
          let arrAux = [];
          //console.log(resp.outputs[0].data.regions);
          resp.outputs[0].data.regions.map(e => {
            const pos = {
              br : e.region_info.bounding_box.bottom_row,
              lc : e.region_info.bounding_box.left_col,
              rc : e.region_info.bounding_box.right_col,
              tr : e.region_info.bounding_box.top_row,
            };
            arrAux.push(pos); 
          })
          res.json(arrAux)
      })
      .catch(err => res.status(400).json('mistake'))
})

app.listen(3001, () => {
	console.log('the server is ok at 5173 port')
});

