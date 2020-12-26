const express = require('express')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite")

const issueRouter = express.Router({mergeParams: true});

issueRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Issue WHERE series_id = $series_id', {
        $series_id: req.series.id
    }, (error, issues) => {
        if (error) {
            next(error)
        } else {
            res.status(200).send({issues: issues})
        }
    })
})

issueRouter.post('/', (req, res, next) => {
    const issue = req.body.issue

    // if statement
    if (issue && issue.name && issue.issueNumber && issue.publicationDate && issue.artistId) {
    db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issue_number, $publication_date, $artist_id, $series_id)', {
        $name: issue.name,
        $issue_number: issue.issueNumber,
        $publication_date: issue.publicationDate,
        $artist_id: issue.artistId,
        $series_id: req.series.id
    }, function (error, issue) {
        if (error) {
            next(error)
        } else {
            db.get(
                "SELECT * FROM Issue WHERE id = $id",
                { $id: this.lastID },
                (error, issue) => {
                  if (error) {
                    next(error);
                  }
                  res.status(201).send({ issue: issue });
                }
              );
        }
    })
} else {
    res.status(400).send()
}
})

issueRouter.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE id = $issueId`, {
        $issueId: issueId
    }, (error, issue) => {
        if (error) {
            next(error)
        } else if (issue) {
            req.issue = issue
            next()
        } else {   
            res.status(404).send()
        }

    })
})

issueRouter.put('/:issueId', (req, res, next) => {
    const issue = req.body.issue

    // if statement
    if (issue && issue.name && issue.issueNumber && issue.publicationDate && issue.artistId) {
    db.run('UPDATE Issue SET name = $name, issue_number = $issue_number, publication_date = $publication_date, artist_id = $artist_id, series_id = $series_id WHERE id = $issue_id', {
        $name: issue.name,
        $issue_number: issue.issueNumber,
        $publication_date: issue.publicationDate,
        $artist_id: issue.artistId,
        $series_id: req.series.id,
        $issue_id: req.issue.id
    }, function (error, issue) {
        if (error) {
            next(error)
        } else {
            db.get(
                "SELECT * FROM Issue WHERE id = $id",
                { $id: req.issue.id },
                (error, issue) => {
                  if (error) {
                    next(error);
                  }
                  res.status(200).send({ issue: issue });
                }
              );
        }
    })
} else {
    res.status(400).send()
}
})

issueRouter.delete('/:issueId', (req, res, next) => {
    db.run('DELETE FROM Issue WHERE id = $issue_id', {
        $issue_id: req.issue.id
    }, (error, issue) => {
        if (error) {
            next(error)
        } else {
            res.status(204).send()
        }
    })
})

module.exports = issueRouter