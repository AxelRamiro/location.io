<p align="center">
  <img src="http://location.io/wp-content/themes/responsive-location/images/logo.jpg" alt="Location.IO Logo"/>
</p>

[![build status](https://secure.travis-ci.org/alexbirkett/location.io.png)](http://travis-ci.org/alexbirkett/location.io)
Location.IO
===========

Location.IO is a modular server designed to provide a common interface to GPS tracking devices using a single TCP/IP port for all protocols.



# Protocol Implementation #

## Terminology ##
### Up messages ###
Up messages are sent from the tracking device to the server.

### Down messages ###
Down messages are sent from the server to the tracking device.

### Up messsage ACKs ###
Some protocols require up messages to be acknowledged by the server. The 'Up message ACK' is a special case of a 'down message'.

### Down message ACKs ###
Some protocols require down messages to be acknowledged by the tracker. The 'Down message ACK' is a special case of an 'up message'.


