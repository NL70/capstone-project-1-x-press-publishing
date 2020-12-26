const express = require('express')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite")

const artistsRouter = express.Router()

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist WHERE id = $artistId`, {
        $artistId: artistId
    }, (error, artist) => {
        if (error) {
            next(error)
        } else if (artist) {
            req.artist = artist
            next()
        } else {
            res.status(404).send()
        }

    })
})

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, artists) => {
        if (error) {
            next(error)
        } else {
            res.status(200).send({artists: artists})
        }
    })
})

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).send({artist: req.artist})
})

artistsRouter.post('/', (req, res, next) => {
    const artist = req.body.artist
    if (artist.name && artist.dateOfBirth && artist.biography) {
       artist.isCurrentlyEmployed = artist.isCurrentlyEmployed || 1;
       db.run(
        `
          INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
          VALUES ($name, $date_of_birth, $biography, $is_currently_employed)
        `,
        {
          $name: artist.name,
          $date_of_birth: artist.dateOfBirth,
          $biography: artist.biography,
          $is_currently_employed: artist.isCurrentlyEmployed,
        },
        function (error) {
          if (error) {
            next(error);
          } else {
            db.get(
              "SELECT * FROM Artist WHERE id = $id",
              { $id: this.lastID },
              (error, artist) => {
                if (error) {
                  next(error);
                }
                res.status(201).send({ artist: artist });
              }
            );
          }
        }
      );
   
    } else {
        res.status(400).send()
    }
})

artistsRouter.put('/:artistId', (req, res, next) => {
  const artist = req.body.artist
  if (artist.name && artist.dateOfBirth && artist.biography && artist.isCurrentlyEmployed && req.params.artistId) {
    db.run('UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId', {
      $name: artist.name, 
      $dateOfBirth: artist.dateOfBirth,
      $biography: artist.biography,
      $isCurrentlyEmployed: artist.isCurrentlyEmployed,
      $artistId: req.params.artistId
    }, (error, artist) => {
      if (error) {
        next(error)      
      } else {
        db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
          $artistId: req.params.artistId
        }, (error, artist) => {
          if (error) {
            next (error)
          }
          res.status(200).send({ artist: artist})
        })
      }
    })

  } else {
    res.status(400).send()
  }
})

artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run('UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId', {
    $artistId: req.params.artistId
  }, (error, artist) => {
    if (error) {
      next(error)
    } else {
      db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
        $artistId: req.params.artistId
      }, (error, artist) => {
        if (error) {
          next(error)
        }
        res.status(200).send({artist:artist})
      })
    }
  })
})

module.exports = artistsRouter