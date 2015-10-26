<?php
/**
 * Database configuration
 */
 
define('DB_USERNAME', 'wwwwavey_admin');
define('DB_PASSWORD', '!1loveWavey!');
//define('DB_HOST', 'wavey.co.za');
define('DB_HOST', 'localhost');
define('DB_NAME', 'wwwwavey_data');

define('SUCCESS', 0);
define('FAIL', 1);
define('UNKNOWN_ERROR', 2);

define('USER_CREATED_SUCCESSFULLY', 0);
define('USER_CREATE_FAILED', 1);
define('USER_ALREADY_EXISTS', 2);

define('EMAIL_UPDATED_SUCCESSFULLY', 0);
define('EMAIL_UPDATED_FAILED', 1);

define('PASSWORD_UPDATED_SUCCESSFULLY', 0);
define('PASSWORD_UPDATE_FAILED', 1);
define('PASSWORD_UPDATE_INVALID_CREDENTIALS', 2);

define('ISSUE_LOGGED_SUCCESSFULLY', 0);
define('ISSUE_LOG_FAILED', 1);
define('ISSUE_FOR_SPOT_ALREADY_EXISTS', 2);

define('PIC_UPDATED_SUCCESSFULLY', 0);
define('PIC_UPDATE_FAILED', 1);
?>