const express = require('express')
const sqlite3 = require('sqlite3')
const issueRouter = require('./issue')

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite")

const seriesRouter = express.Router()

seriesRouter.use('/:seriesId/issues', issueRouter)

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (error, series) => {
        if (error) {
            next(error)
        }
        res.status(200).send({ series: series })
    })
})

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = $seriesId`, {
        $seriesId: req.params.seriesId
    }, (error, series) => {
        if (error) {
            next(error)
        } else if (series) {
            req.series = series
            next()
        } else {   
            res.status(404).send()
        }

    })
})

seriesRouter.get('/:seriesId', (req, res, next) => {
  console.log(req.series)
    db.get('SELECT * FROM Series WHERE id = $seriesId', {
        $seriesId: req.series.id
    }, (error, series) => {
        if (error) {
            next(error)
        } else if (series) {
            res.status(200).send({series: series})
        } else {
            res.status(404).send()
        }
    })
})

seriesRouter.post('/', (req, res, next) => {
    const series = req.body.series
    console.log(series)
    if (series.name && series.description) {
       db.run(
        `
          INSERT INTO Series (name, description)
          VALUES ($name, $description)
        `,
        {
          $name: series.name,
          $description: series.description,
        },
        function (error) {
          if (error) {
            next(error);
          } else {
            db.get(
              "SELECT * FROM Series WHERE id = $id",
              { $id: this.lastID },
              (error, series) => {
                if (error) {
                  next(error);
                }
                res.status(201).send({ series: series });
              }
            );
          }
        }
      );
   
    } else {
        res.status(400).send()
    }
})

seriesRouter.put('/:seriesId', (req, res, next) => {
    const series = req.body.series
    if (series.name && series.description) {
      db.run('UPDATE Series SET name = $name, description = $description WHERE id = $seriesId', {
        $name: series.name, 
        $description: series.description,
        $seriesId: req.series.id
      }, (error, series) => {
        if (error) {
          next(error)
        } else {
          db.get('SELECT * FROM Series WHERE id = $seriesId', {
            $seriesId: req.series.id
          }, (error, series) => {
            if (error) {
              next(error)
            }
            res.status(200).send({series:series})
          })
        }
        
      })
  
    } else {
      res.status(400).send()
    }
  })

seriesRouter.delete('/:seriesId', (req, res, next) => {
  db.all('SELECT * FROM Issue WHERE series_id = $id', {
    $id: req.series.id
  }, (error, issues) => {
    if (error) {
      next(error)
    } else if (issues.length) {
      res.status(400).send()
    } else {
      db.run('DELETE FROM Series WHERE id = $id', {
        $id: req.series.id
      }, (error, series) => {
        if (error) {
          next(error)
        }
        res.status(204).send()
      })
    }
  })
})

module.exports = seriesRouter

