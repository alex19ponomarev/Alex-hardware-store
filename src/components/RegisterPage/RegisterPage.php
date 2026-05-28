<?php 
    if($_SERVER['REQUEST_METHOD']=='POST')
    {
        $email = $_POST['email'];
        $password = $_POST['password'];
        $name = $_POST ['name'];
        $server= "localhost";
        $dbname = "alextechstoredatebei";
        $dblogin= "root";
        $dbpass= "";
        $dbstr="mysql:host=$server;dbname=$dbname";
        try
        {
    
            $pdo = new PDO($dbstr,$dblogin,$dbpass);
            $stmt =$pdo->query("Insert Into users(email,password,name)VALUES('$email','$password','$name')");
            header("Location:http://localhost:5173/login/");



        }
        catch(PDOExeption $ex)
        {

            echo $ex->getMessage();
        
        }
    
    
   }




?>