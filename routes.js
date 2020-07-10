const express = require('express')
const routes = express.Router();
const availableTimes = require('./services/availableTimes')
const listCalendarEventes = require('./services/listCalendarEvents')
const addEvent = require('./services/addEvent')
const getEvent = require('./services/getEvent')
const deleteEvent = require('./services/deleteEvent')
const updateEvent = require('./services/updateEvent')

routes.post('/availableTimes', availableTimes.read)
routes.post('/calendarEvents', listCalendarEventes.read)
routes.post('/addEvent', addEvent.create)
routes.get('/getEvent', getEvent.get)
routes.delete('/deleteEvent', deleteEvent.delete)
routes.post('/updateEvent', updateEvent.update)

module.exports = routes
