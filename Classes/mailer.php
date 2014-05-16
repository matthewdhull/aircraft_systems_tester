<?php

require 'vendor/autoload.php';

use Mailgun\Mailgun;

# First, instantiate the SDK with your API credentials and define your domain. 

$mg = new Mailgun("key-8v4gd4s89nfepq1ita6oglfe202l9fi3");
$domain = "matthewdanielhull.com";

# Now, compose and send your message.
$mg->sendMessage($domain, array('from'    => 'notifications@matthewdanielhull.com', 
                                'to'      => 'matthewdanielhull@gmail.com', 
                                'subject' => 'The PHP SDK is awesome!', 
                                'text'    => 'It is so simple to send a message.'));
?>