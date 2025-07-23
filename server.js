var express = require("express");
var mysql2 = require("mysql2");
var app = express();
var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;

var app = express();//app() returns an Object:app
app.use(fileuploader());//for receiving files from client and save on server files


app.use(express.static("public"));
app.use(express.json());
//==========================Ai===============//
const { GoogleGenerativeAI} = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBvCn6f8Tf8NJS5BITI_ciWgxJmyLc3Z-c"); // api key of gemini on ai studio
const model = genAI. getGenerativeModel({ model: "gemini-2.0-flash"});
//===============================================//

app.listen(2006, function () {
    console.log("Server Started at Port no: 2006")
})

app.get("/", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);

    let path = __dirname + "/public/index.html";
    resp.sendFile(path);
})

//-------------------Aiven-----------------//
let dbConfig = "mysql://avnadmin:AVNS_yXVnFqyPWEuzhGvwWPd@mysql-234be85a-keshavgarg586-fce8.c.aivencloud.com:22934/defaultdb";
let mySqlVen = mysql2.createConnection(dbConfig);
mySqlVen.connect(function (errKuch) {
    if (errKuch == null)
        console.log("AiVen Connected Successfulllyyy!!!!");
    else
        console.log(errKuch.message)
})


//==--------------------Cloudinary------------------------------------------//
app.use(express.urlencoded(true)); //convert POST data to JSON object

cloudinary.config({
    cloud_name: 'di1kjag0f',
    api_key: '466379642234883',
    api_secret: 'NPqIhlnZp6PTVvfBoxRygdasLYU' // Click 'View API Keys' above to copy your API secret
});
//----------------------Signup-------------------------------------------//
app.get("/signup", function (req, resp) {
    let txtEmail = req.query.txtEmail;
    let txtPwd = req.query.txtPwd;
    let comboUser = req.query.comboUser;

    mySqlVen.query("insert into users2006 values(?,?,?,current_date(),1)", [txtEmail, txtPwd, comboUser], function (errKuch) {
        if (errKuch == null)
            resp.send("Record Saved Successfulllyyy");
        else
            resp.send(errKuch.message)

    })
})
//=------------------Login=-------------------------------//
app.get("/login", function (req, resp) {
    let txtEmailLogin = req.query.txtEmailLogin;
    let txtPwdLogin = req.query.txtPwdLogin;

    mySqlVen.query(
        "SELECT * FROM users2006 WHERE txtemail = ? AND txtPwd = ?",
        [txtEmailLogin, txtPwdLogin],
        function (err, allRecords) {
            if (allRecords.length == 0) {
                resp.send("Invalid");
            }
            else if (allRecords[0].status == 1) {
                resp.send(allRecords[0].comboUser);
            }
            else
                resp.send("Blocked");

        });
});

//-------------------------------Send to server-Organizer----------------------//
app.post("/Send-to-Server", async function (req, resp) {
    let picurl = "";
    if (req.files != null) {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = ""

    let emailid = req.body.emailid;
    let orgname = req.body.orgname;
    let regnumber = req.body.regnumber;
    let address = req.body.address;
    let city = req.body.city;
    let sports = req.body.sports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.head;
    let contact = req.body.contact;
    let otherinfo = req.body.otherinfo;


    mySqlVen.query("insert into organizers values(?,?,?,?,?,?,?,?,?,?,?,?)", [emailid, orgname, regnumber, address, city, sports, website, insta, head, contact, picurl, otherinfo], function (errKuch) {
        if (errKuch == null)
            resp.send("Record Saved Successfulllyyy");
        else
            resp.send(errKuch)
    })
})
//----------------------------------Modify-Organizer----------------------------------//
app.post("/modify", async function (req, resp) {
    let picurl = "";
    if (req.files != null) //user wants to Update Profile Pic
    {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server


        });
    }
    else
        picurl = req.body.hdn;


    let emailid = req.body.emailid;
    let orgname = req.body.orgname;
    let regnumber = req.body.regnumber;
    let address = req.body.address;
    let city = req.body.city;
    let sports = req.body.sports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.head;
    let contact = req.body.contact;
    let otherinfo = req.body.otherinfo;

    mySqlVen.query("update organizers set orgname=?,regnumber=?,address=?,city=?,sports=?,website=?,insta=?,head=?,contact=?,picurl=?,otherinfo=? where emailid=?", [orgname, regnumber, address, city, sports, website, insta, head, contact, picurl, otherinfo, emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Record Saved Successfulllyyy");
            else
                resp.send("Inavlid email Id");
        }
        else
            resp.send(errKuch.message)
    })

})
//-----------------------------Search-Organiser-Details--------------------//
app.get("/Search", function (req, resp) {

    mySqlVen.query("select * from organizers where emailid=?", [req.query.emailid], function (err, allRecords) {

        if (err == null) {
            if (allRecords.length == 0)
                resp.send("No Record Found");
            else
                resp.json(allRecords);
        }
        else
            resp.send(errKuch.message)
    })
})
//------------------------------List-Tournament-----------------------------------//

app.post("/List-Tournament", async function (req, resp) {

    let emailid = req.body.emailid;
    let event = req.body.event;
    let doe = req.body.doe;
    let toe = req.body.toe;
    let address = req.body.address;
    let city = req.body.city;
    let sport = req.body.sport;
    let minage = req.body.minage;
    let maxage = req.body.maxage;
    let lastdate = req.body.lastdate;
    let fee = req.body.fee;
    let prize = req.body.prize;
    let contact = req.body.contact;


    mySqlVen.query("insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [null, emailid, event, doe, toe, address, city, sport, minage, maxage, lastdate, fee, prize, contact], function (errKuch) {
        if (errKuch == null)
            resp.send("Record Saved Successfulllyyy");
        else
            resp.send(errKuch)
    })
})

//------------------------------Fetch--------------------------//
app.get("/do-fetch-all-tournaments", function (req, resp) {
  // console.log()
    mySqlVen.query("select rid,event,doe,toe,city,sport,minage,maxage,fee,prize,contact FROM tournaments where emailid=?",[req.query.emailidkuch], function (err, allRecords) {
//console.log(allRecords)
        if (err == null) {
            if (allRecords.length == 0)
                resp.send("No Record Found");
            else
                resp.json(allRecords);
        }
        else
            resp.send(errKuch.message)
    })
})
//=================================Delete Tournament====================//
app.get("/do-delete-tournaments", function (req, resp) {
  // console.log()
    mySqlVen.query("delete FROM tournaments where rid=?",[req.query.ridkuch], function (err) {
//console.log(err)
        if (err == null) {
            
                resp.send("Deleted Successfully");
        }
        else
            resp.send(err.message)
    })
})

//=================================Genrative Ai==================================//
async function RajeshBansalKaChirag(imgurl) {
   // console.log()
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
           
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    // console.log()
    console.log(result.response.text())

    const rawText = result.response.text().trim();

    // ✅ Extract JSON block even if wrapped in ```json ... ```
    const jsonMatch = rawText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Valid JSON not found in AI response");
    }

    const jsonData = JSON.parse(jsonMatch[0]);
     console.log(jsonData);

    return jsonData

}

//--------------------------------Upload-data-Player=========================//
app.post("/Upload-Data", async function (req, resp) {
    let picurl = "";
    let apicurl = "";
    let jsonData=[];

    if (req.files != null) {
        let fName = req.files.profilePicurl.name;
        let afName = req.files.acardpicurl.name;

        let fullPath = __dirname + "/public/uploads/" + fName;
        let afullPath = __dirname + "/public/uploads/" + afName;

        await req.files.profilePicurl.mv(fullPath);
        await req.files.acardpicurl.mv(afullPath);

        await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {
            picurl = picUrlResult.url;
            console.log("Profile Pic URL:", picurl);
        });

        await cloudinary.uploader.upload(afullPath).then(async function (picUrlResult) {
            apicurl = picUrlResult.url;
            console.log("Aadhaar Card Pic URL:", apicurl);
            jsonData=await RajeshBansalKaChirag(apicurl);//Creating json object array to store all the details form upper generative ai code.
        });
    } else {
        picurl = "";
        apicurl = "";
    }
function convertToMySQLDate(ddmmyyyy) {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}`; // returns "1995-06-17"
}

    let emailid = req.body.emailid;
    // let name = req.body.name;
 let dob = convertToMySQLDate(jsonData.dob);

    // let gender = req.body.gender;
    let contactP = req.body.contactP;
    let address = req.body.address;
    let sport = req.body.sport;

    let otherinfo = req.body.otherinfo;

    mySqlVen.query("insert into players values(?,?,?,?,?,?,?,?,?,?)", [emailid, apicurl, picurl, jsonData.name, dob, jsonData.gender, contactP, address, sport, otherinfo], function (errKuch) {
        if (errKuch == null)
            resp.send("Record Saved Successfulllyyy");
        else
            resp.send(errKuch)
    }
    );
});

//====================================Modify Players Profile=======================//
app.post("/ModifyProfile", async function (req, resp) {
    let picurl = "";
    let apicurl = "";

    if (req.files && req.files.profilePicurl && req.files.acardpicurl) {

        let fName = req.files.profilePicurl.name;
        let afName = req.files.acardpicurl.name;

        let fullPath = __dirname + "/public/uploads/" + fName;
        let afullPath = __dirname + "/public/uploads/" + afName;

        await req.files.profilePicurl.mv(fullPath);
        await req.files.acardpicurl.mv(afullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;
            console.log("Profile Pic URL:", picurl);
        });

        await cloudinary.uploader.upload(afullPath).then(function (picUrlResult) {
            apicurl = picUrlResult.url;
            console.log("Aadhaar Card Pic URL:", apicurl);
        });
    } else {
        picurl = req.body.hdn;
        apicurl = req.body.hdn1;
    }
    let emailid = req.body.emailid;
    let contactP = req.body.contactP;
    let address = req.body.address;
    let sport = req.body.sport;
    let otherinfo = req.body.otherinfo;

    mySqlVen.query("update players set acardpic=?,profilePicurl=?,contactP=?,address=?,sport=?,otherinfo=? where emailid=?", [apicurl, picurl, contactP, address, sport, otherinfo, emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Record Saved Successfulllyyy");
            else
                resp.send("Inavlid email Id");
        }
        else
            resp.send(errKuch.message)
    })

})
//=======================Get Data PLAYER======================//
app.get("/Get-Data", function (req, resp) {

    mySqlVen.query("select * from players where emailid=?", [req.query.emailid], function (err, allRecords) {

        if (err == null) {
            if (allRecords.length == 0)
                resp.send("No Record Found");
            else
                resp.json(allRecords);
        }
        else
            resp.send(err.message)
    })
})
//===========================Fill User Admin Console==================================//
app.get("/fill-user-admin", function (req, resp) {
    mySqlVen.query("SELECT txtEmail, txtPwd, comboUser, status FROM users2006", function (err, result) {
        if (err == null) {

            resp.send(result); // result is an array of rows
        } else {

            resp.send(err); // Send actual error
        }
    });
});
//======================Block User==================================//
app.get("/block-user", function (req, resp) {
    let txtEmail = req.query.emailidKuch;
    //console.log(req.query)
    mySqlVen.query(
        "UPDATE users2006 SET status=? WHERE txtEmail=?",
        [0, txtEmail],
        function (err, result) {
            if (err == null) {
                if (result.affectedRows == 1)
                    resp.send({ message: "User blocked successfully" });
                else
                    resp.send({ message: "No user updated" });
            } else {

                resp.send({ err });
            }
        }
    );
});
//======================UnBlock User==================================//
app.get("/Unblock-user", function (req, resp) {
    let txtEmail = req.query.emailidKuch;
    //console.log(req.query)
    mySqlVen.query(
        "UPDATE users2006 SET status=? WHERE txtEmail=?",
        [1, txtEmail],
        function (err, result) {
            if (err == null) {
                if (result.affectedRows == 1)
                    resp.send({ message: "User Unblocked successfully" });
                else
                    resp.send({ message: "No user updated" });
            } else {

                resp.send({ err });
            }
        }
    );
});
//======================Organiser list==================================//
app.get("/organisers-list", function (req, resp) {
    mySqlVen.query("SELECT emailid, orgname, regnumber, contact,sports FROM organizers", function (err, result) {
        if (err == null) {

            resp.send(result); // result is an array of rows
        } else {

            resp.send(err); // Send actual error
        }
    });
});
//======================Player list==================================//
app.get("/player-list", function (req, resp) {
    mySqlVen.query("SELECT emailid, acardpic, profilePicurl, name,dob,gender,contactP,address,sport FROM players", function (err, result) {
        if (err == null) {

            resp.send(result); // result is an array of rows
        } else {

            resp.send(err); // Send actual error
        }
    });
});

//=================================/do-fetch-all-cities====//
app.get("/do-fetch-all-cities", function (req, resp) {
    mySqlVen.query("SELECT DISTINCT city FROM tournaments", function (err, result) {
        if (err == null) {

            resp.send(result); // result is an array of rows
        } else {

            resp.send(err); // Send actual error
        }
    });
});
//------------------------------/fetch-all-tournaments=============================//
app.get("/fetch-all-tournaments", function (req, resp) {

    mySqlVen.query("select * from tournaments where city=? and sport=?", [req.query.kuchCity, req.query.kuchGame], function (err, allRecords) {
        if (err == null) {
            //console.log(req.allRecords)
            resp.send(allRecords); // result is an array of rows
        } else {

            resp.send(err); // Send actual error
        }
    })
})

//---------------------------/Update-Password-Player---------------------------//
app.get("/Update-Password", function (req, resp) {
    console.log();
    mySqlVen.query("UPDATE users2006 SET txtPwd = ? where txtEmail=? and txtPwd=?", [req.query.kuchnewPwd, req.query.kuchEmail, req.query.kucholdPwd], function (err, result) {
        if (err) {
            console.log(err);
            resp.send("Error updating password");
        } else {
            if (result.affectedRows === 1) {
                resp.send("Password updated successfully");
            } else {
                resp.send("Invalid email or old password");
            }
        }

    })
})