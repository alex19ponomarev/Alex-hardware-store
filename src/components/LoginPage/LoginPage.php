<?php 
    if($_SERVER['REQUEST_METHOD']=='POST')
    {
        $email = $_POST['email'];
        $password= $_POST['password'];
        $server= "localhost";
        $dbname = "alextechstoredatebei";
        $dblogin= "root";
        $dbpass= "";
        $dbstr="mysql:host=$server;dbname=$dbname";
        try
        {
    
            $pdo = new PDO($dbstr,$dblogin,$dbpass);
            $stmt =$pdo->query("SELECT*FROM users" );
        
            foreach($stmt as $row)
            {


                if($email == $row[1] && $password== $row[2])
                {
                    header("Location:http://localhost:5173/catalog");
                    break;
                } 
                
                
                
            }
            


        }
     catch(PDOExeption $ex)
        {

        echo $ex->getMessage();
        
        }    
    
   }




?>