$(document).ready(()=>{
    // get course key from url
    let search = window.location.search.substring(1)
    let urlsp = new URLSearchParams(search)
    let courseKey = urlsp.get('course')
    // get data from database by courseID
    let courseID = 'courseID_'+courseKey
    db.ref('course').child(courseID).get().then((snapshot)=>{
    let timeOptions= snapshot.val().timeOptions
    $("#courseTitle").text(snapshot.val().courseName)
    timeOptions.forEach((option)=>{
        let timeData = dayTime[option.split("_")[0]].slice(0,3)+' '+hourTime[option.split("_")[1]]
        let $option = $(`<th scope="col">${timeData}</th>`)
        $("#dataTitle").append($option)
    })
    db.ref('enroll').orderByChild('courseID').equalTo(courseID).on("child_added", function(snapshot) {
        console.log(snapshot.val());
        let $row=$(`<tr></tr>`)
        $('tbody').append($row)
        let name=snapshot.val().firstName+' '+snapshot.val().lastName
        let $name=$(`<td>${name}</td>`)
        $row.append($name)
        let timeSelect = snapshot.val().timeOptions

        timeOptions.forEach((option)=>{
            console.log(option)
            if(timeSelect.indexOf(option)==-1){
                // put 'No' in the table
                console.log("nnn", option)
                $row.append($(`<td></td>`))
            }else{
                // put 'Yes' in the table
                console.log("yyy", option)
                $row.append($(`<td>Yes</td>`))
            }
        })
    });
 })
})
