<?php

require_once '../include/DbHandler.php';
require_once '../include/PassHash.php';
require '.././libs/Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

// User id from db - Global Variable
//$user_id = NULL;
$EmailAdmin = "ashleymsanders2@gmail.com,cameron.w.sanders@gmail.com";
//$EmailAdmin = "cameron.w.sanders@gmail.com";
$EmailFrom = "waveygolive@wavey.co.za";

/**
 * ----------- METHODS WITHOUT AUTHENTICATION ---------------------------------
 */
 /* GET ALL THE REGIONS */
 $app->get('/regions', function() {
			$response = array();
            $db = new DbHandler();

            // fetching all user tasks
            $result = $db->getRegions();
            $response["error"] = false;
			$response["regions"] = $result;

            echoRespnse(200, $response);
        });
/* GET ALL THE SPOTS FOR ALL THE REGIONS*/
$app->get('/spots', function() {
			$response = array();
            $db = new DbHandler();

            // fetching all user tasks
            $result = $db->getAllSpots();
			
            $response["error"] = false;	
			$response["spots"] = $result;

            echoRespnse(200, $response);
        });
/**
 * User Registration
 * url - /register
 * method - POST
 * params - name, email, password
 */
$app->post('/signup', function() use ($app) {
        // check for required params
        verifyRequiredParams(array('username', 'email', 'password'));			

        // reading post params
        $username = $app->request->post('username');
        $email = $app->request->post('email');
        $password = $app->request->post('password');
			
		// validating email address
        validateEmail($email);

        $db = new DbHandler();
        $res = $db->createUser($username, $email, $password);

        if ($res == USER_CREATED_SUCCESSFULLY) {
            $response["error"] = false;
            $response["message"] = "You are successfully registered";
        } else if ($res == USER_CREATE_FAILED) {
            $response["error"] = true;
            $response["message"] = "Oops! An error occurred while registereing";
        } else if ($res == USER_ALREADY_EXISTS) {
            $response["error"] = true;
            $response["message"] = "Sorry, this email or username already exists";
        }
        // echo json response
        echoRespnse(201, $response);
    });

/**
 * User Login
 * url - /login
 * method - POST
 * params - email, password
 */
$app->post('/login', function() use ($app) {
            // check for required params
            verifyRequiredParams(array('email', 'password'));

            // reading post params
            $email = $app->request()->post('email');
            $password = $app->request()->post('password');
            $response = array();
			
			//$response['email'] = $email;
			//$response['password'] = $password;

            $db = new DbHandler();
            // check for correct email and password
            if ($db->checkLogin($email, $password)) {
                // get the user by email
                $user = $db->getUserByEmail($email);
				//global $user_id;
				//$user_id = $user['id'];

                if ($user != NULL) {
                    $response["error"] = false;
                    $response['id'] = $user['id'];
                    $response['username'] = $user['username'];
                    $response['email'] = $user['email'];
					$response['profilepic'] = $user['profilepic'];
					$favourites = array();
					$favourites = $db->getFavourites($response['id']);
					$response['favourites'] = $favourites;
                } else {
                    // unknown error occurred
                    $response['error'] = true;
                    $response['message'] = "An error occurred. Please try again";
                }
            } else {
                // user credentials are wrong
                $response['error'] = true;
                $response['message'] = 'Login failed. Incorrect credentials';
            }

            echoRespnse(200, $response);
        });

/**
 *
 */
 /*
$app->post('/updateEmail', function() use ($app) {
		verifyRequiredParams(array('userId', 'newEmail'));

        // reading post params
        //$email = $app->request()->post('email');
        $user_id = $app->request()->post('userId');
        $newEmail = $app->request()->post('newEmail');
        $response = array();
		//global $user_id;

		validateEmail($newEmail);

        $db = new DbHandler();
		$res = $db->updateEmail($user_id, $newEmail);

		if ($res == EMAIL_UPDATED_SUCCESSFULLY) {
            $response["error"] = false;
            $response["message"] = "Email has been changed successfully";
			$response["email"] = $newEmail;
        } else if ($res == EMAIL_UPDATED_FAILED) {
            $response["error"] = true;
            $response["message"] = "Oops! An error occurred while attempting to update your email";
        } else if ($res == USER_ALREADY_EXISTS) {
            $response["error"] = true;
            $response["message"] = "Sorry, this email already exists";
        }
        // echo json response
        echoRespnse(201, $response);
	});*/

$app->post('/updatePassword', function() use ($app) {
		verifyRequiredParams(array('userId', 'oldPassword', 'newPassword'));
		
        $response = array();
		
        // reading post params
        //$email = $app->request()->post('email');
        //$user_id = $app->request()->post('userId');
        $oldPassword = $app->request()->post('oldPassword');
        $newPassword = $app->request()->post('newPassword');

		//global $user_id;

        $db = new DbHandler();
		$res = $db->updatePassword($user_id, $oldPassword, $newPassword);

		if ($res == PASSWORD_UPDATED_SUCCESSFULLY) {
            $response["error"] = false;
            $response["message"] = "Password Update successfull";
        } else if ($res == PASSWORD_UPDATE_FAILED) {
            $response["error"] = true;
            $response["message"] = "Oops! An error occurred while attempting to update your password";
        } else if ($res == PASSWORD_UPDATE_INVALID_CREDENTIALS) {
            $response["error"] = true;
            $response["message"] = "Login failed. Incorrect credentials";
        }
        // echo json response
        echoRespnse(201, $response);
	});

	
$app->post('/updateProfilePic', function() use ($app) {
		verifyRequiredParams(array('userId', 'profilepic'));
		
        $response = array();
		
        // reading post params
        //$email = $app->request()->post('email');
        //$user_id = $app->request()->post('userId');
        $profilepic = $app->request()->post('profilepic');

		//global $user_id;

        $db = new DbHandler();
		$res = $db->updateProfilePic($user_id, $profilepic);

		if ($res == PIC_UPDATED_SUCCESSFULLY) {
            $response["error"] = false;
            $response["message"] = "Profile Pic Update successfull";
        } else if ($res == PIC_UPDATE_FAILED) {
            $response["error"] = true;
            $response["message"] = "Oops! An error occurred while attempting to update your profile pic";
        }
        // echo json response
        echoRespnse(201, $response);
	});

$app->post('/toggleFavourite', function() use ($app) {
		verifyRequiredParams(array('userId', 'spotId'));

		//global $user_id;
		
        $response = array();
		
        // reading post params
        //$email = $app->request()->post('email');
        $user_id = $app->request()->post('userId');
        $spotId = $app->request()->post('spotId');

        $db = new DbHandler();
		$res = $db->toggleFavourite($user_id, $spotId);

		$response = array();
		$response["error"] = false;
		$response["favourites"] = $res;
        // echo json response
        echoRespnse(201, $response);
	});
	
$app->post('/reportSpotIssue', function() use ($app) {
		verifyRequiredParams(array('userId', 'spotId', 'airdata', 'seadata', 'cam'));
		
        $response = array();
		
        // reading post params
        //$email = $app->request()->post('email');
        //$user_id = $app->request()->post('userId');
        $spotId = $app->request()->post('spotId');
        $airdata = $app->request()->post('airdata');
        $seadata = $app->request()->post('seadata');
		$cam = $app->request()->post('cam');

		//global $user_id;

        $db = new DbHandler();
		//$res = $db->toggleFavourite($email, $spotId);
		$res = $db->reportIssue($user_id, $spotId, $airdata, $seadata, $cam);
		$spot = $db->getSpot($spotId);
		$user = $db->getUserById($user_id);

		$response = array();
		$response["airdata"] = $airdata;
		$response["seadata"] = $seadata;
		$response["cam"] = $cam;

		if ($res == ISSUE_LOGGED_SUCCESSFULLY) {
			//try send email here
			sendErrorReport($user, $spot, $airdata, $seadata, $cam);
			$response["error"] = false;
			$response["message"] = "Thanks for letting us know there's a problem.<br>We'll contact you should we require more details.";
		} else if ($res == ISSUE_LOG_FAILED) {
			$response["error"] = true;
			$response["message"] = 'Oops! We are unable to log an issue for this spot.';
		} else if ($res == ISSUE_FOR_SPOT_ALREADY_EXISTS) {
			$response["error"] = true;
			$response["message"] = 'An issue has already been logged for this spot';
		}
        // echo json response
        echoRespnse(201, $response);
	});

$app->post('/addSpotRequest', function() use ($app) {
		verifyRequiredParams(array('userId', 'spotName', 'regionName', 'country'));
		
        $response = array();
		
        // reading post params
        //$email = $app->request()->post('email');
        //$user_id = $app->request()->post('userId');
        $spotName = $app->request()->post('spotName');
        $regionName = $app->request()->post('regionName');
        $country = $app->request()->post('country');

		//global $user_id;

		$db = new DbHandler();
		$user = $db->getUserById($user_id);

		global $EmailAdmin;
		global $EmailFrom;
		$EmailTo = $EmailAdmin;
		$Subject = "A user has submitted a request to Add a Spot";

		// prepare email body text
		$Body = "";
		$Body .= "Country: {$country}";
		$Body .= "\n";
		$Body .= "Region: {$regionName}";
		$Body .= "\n";
		$Body .= "Spot Name: {$spotName}";
		$Body .= "\n";
		$Body .= "\n";
		$Body .= "Username  = " . $user["username"];
		$Body .= "\n";
		$Body .= "Email = " . $user["email"];
		$Body .= "\n";

		// send email 
		$success = mail($EmailTo, $Subject, $Body, "From: <$EmailFrom>");

		if ($success) {
			//try send email here

			$EmailTo = $user["email"];
			$Subject = "Thanks for your request!";

			// prepare email body text
			$Body = "";
			$Body = "We will attend to your request as soon as we can. For now, here's your copy of what you have requested from us:\n";
			$Body .= "\n";
			$Body .= "\n";
			$Body .= "Add New Spot with the following details->";
			$Body .= "\n";
			$Body .= "\n";
			$Body .= "Country: {$country}";
			$Body .= "\n";
			$Body .= "Region: {$regionName}";
			$Body .= "\n";
			$Body .= "Spot Name: {$spotName}";
			$Body .= "\n";
			$Body .= "\n";
			$Body .= "If you have any questions, please feel free to contact us";
			$Body .= "\n";
			$Body .= "\n";
			$Body .= "www.wavey.co.za | info@wavey.co.za";

			// send email 
			$success = mail($EmailTo, $Subject, $Body, "From: <$EmailFrom>");

			$response["error"] = false;
			$response["message"] = "Thanks for your request.<br/>We'll add the spot as soon as we can.";
		} else {
			$response["error"] = true;
			$response["message"] = "Appologies. We can't seem to submit your request at this time.";
		}
        // echo json response
        echoRespnse(201, $response);
	});

function sendErrorReport($user, $spot, $airdata, $seadata, $cam) {	
	global $EmailAdmin;
	global $EmailFrom;
	$EmailTo = $EmailAdmin;
	$Subject = "A user has submitted an issue report for " . $spot["name"];

	// prepare email body text
	$Body = "";
	$Body .= "Air data: {$airdata}\n";
	$Body .= "Sea data: {$seadata}\n";
	$Body .= "Webcam: {$cam}\n";
	$Body .= "\n";
	$Body .= "Username: " . $user["username"] ."\n";
	$Body .= "Email: " . $user["email"] ."\n";

	// send email 
	$success = mail($EmailTo, $Subject, $Body, "From: <$EmailFrom>");
	return $success;
}

/**
 * Verifying required params posted or not
 */
function verifyRequiredParams($required_fields) {
    $error = false;
    $error_fields = "";
    $request_params = array();
    $request_params = $_REQUEST;
    // Handling PUT request params
    if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
        $app = \Slim\Slim::getInstance();
        parse_str($app->request()->getBody(), $request_params);
    }
    foreach ($required_fields as $field) {
        if (!isset($request_params[$field]) || strlen(trim($request_params[$field])) <= 0) {
            $error = true;
            $error_fields .= $field . ', ';
        }
    }

    if ($error) {
        // Required field(s) are missing or empty
        // echo error json and stop the app
        $response = array();
        $app = \Slim\Slim::getInstance();
        $response["error"] = true;
        $response["message"] = 'Required field(s) ' . substr($error_fields, 0, -2) . ' is missing or empty';
        echoRespnse(400, $response);
        $app->stop();
    }
}

/**
 * Validating email address
 */
function validateEmail($email) {
    $app = \Slim\Slim::getInstance();
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response["error"] = true;
        $response["message"] = 'Email address is not valid';
		$response["email"] = $email;
        echoRespnse(400, $response);
        $app->stop();
    }
}

/**
 * Echoing json response to client
 * @param String $status_code Http response code
 * @param Int $response Json response
 */
function echoRespnse($status_code, $response) {
    $app = \Slim\Slim::getInstance();
    // Http response code
    $app->status($status_code);

    // setting response content type to json
    $app->contentType('application/json');

    echo json_encode($response);
}

$app->run();
?>