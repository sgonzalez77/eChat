// ============================
//  Port
// ============================
process.env.PORT = process.env.PORT || 3000;

// ============================
//  Environment
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  Database
// ============================
let urlDB;

//Environment variables in the server must be declared
//before uploading to production
if (process.env.NODE_ENV === 'dev') {
  urlDB = 'mongodb://localhost:27017/eChat';
} else {
  urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

// ============================
//  Token expiration
// ============================
//how many time is this?
process.env.TOKEN_EXPIRATION = '10h';

// ============================
//  Authentication SEED
// ============================
process.env.SEED = process.env.SEED || 'this-is-development-seed';
