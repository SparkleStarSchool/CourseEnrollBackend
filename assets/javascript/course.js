$(document).ready(()=>{
    // create course dropdown
    db.ref("course").get().then((snapshot)=>{
        let data = snapshot.val()
        let keys = Object.keys(data)
        keys.forEach(key=>{
            // create new option and add event
            let $courseOption = $(`<option value=${key}>${data[key].courseName}</option>`)
            $("#courseName").append($courseOption)
        })
    })
    // create time dropdown
    Object.keys(dayTime).forEach((key)=>{
        let $dayOption = $(`<option value=${key}>${dayTime[key]}</option>`)
        $("#courseDay").append($dayOption)
    })
    Object.keys(hourTime).forEach((key)=>{
        let $timeOption = $(`<option value=${key}>${hourTime[key]}</option>`)
        $("#courseTime").append($timeOption)
    })
    // add each click event for select each course
    $("#courseName").on('change', ()=>{
        $("#courseName").removeClass('warningBorder')
        $("#timeList").empty()
        let courseID=$("#courseName").val()
        if(courseID!=''){
            //get course infor
            db.ref("course").child(courseID).get().then((snapshot)=>{
                let courseInfor = snapshot.val()
                if(courseInfor.timeOptions){
                    courseInfor.timeOptions.forEach((option)=>{
                        let dayOption = option.split("_")[0]
                        let timeOption = option.split("_")[1]
                        let $courseDayItem = $(`<li>${dayTime[dayOption]} ${hourTime[timeOption]} <span class="deleteOption">X</span></li>`)
                        $courseDayItem.find("span").on('click',()=>{
                            $courseDayItem.remove()
                        })
                        $("#timeList").append($courseDayItem)
                    })
                }
            })
        }
    })
    $("#inputCourse").on('change',()=>{
        $("#inputCourse").removeClass('warningBorder')
    })
    // add course
    $("#addCourse").on('click',()=>{
        $("#inputCourse").removeClass('warningBorder')
        let courseName = $("#inputCourse").val()
        if(courseName !=''){
            // set back css
            let courseID = 'courseID_'+ getRandomKey()
            db.ref("course")
            .child(courseID)
            .set({ courseName: courseName})
            .then(() => {
                // refresh page
                location.reload();
            })
        }else{
            $("#inputCourse").addClass('warningBorder')
        }
    })
    $("#courseDay").on('change', ()=>{
        $("#courseDay").removeClass('warningBorder')
    })
    $("#courseTime").on('change', ()=>{
        $("#courseTime").removeClass('warningBorder')
    })
    // add time
    $("#addTime").on('click',()=>{
        $("#courseDay").removeClass('warningBorder')
        $("#courseTime").removeClass('warningBorder')
        let courseDay = $("#courseDay").val()
        let courseTime = $("#courseTime").val()
        if(courseDay==''){
            $("#courseDay").addClass('warningBorder')
        }else if(courseTime==''){
            $("#courseTime").addClass('warningBorder')
        }else{
            let $courseDayItem = $(`<li>${dayTime[courseDay]} ${hourTime[courseTime]} <span class="deleteOption">X</span></li>`)
            $courseDayItem.find("span").on('click',()=>{
                $courseDayItem.remove()
            })
            $("#timeList").append($courseDayItem)
        }
    })
    // copy link
    $("#copyLink").on("click",()=>{
        $("#courseName").removeClass('warningBorder')
        $("#courseDay").removeClass('warningBorder')
        $("#courseTime").removeClass('warningBorder')
        let courseID=$("#courseName").val()
        let times=$("#timeList").children().length
        if(courseID && times!=0){
            let courseKey=courseID.split('_')[1]
            // url for client 
            let url="https://sparklestarschool.github.io/CourseEnroll/index.html?course="+courseKey
            navigator.clipboard.writeText(url)
            .then(() => {
                $("#confirmModal").find(".modal-body").find("p").text("Copied !")
                $("#confirmModal").modal();
            })
            .catch(err => {
                $("#confirmModal").find(".modal-body").find("p").text("Error !")
                $("#confirmModal").modal();
            })
            
        }else if(!courseID){
            $("#courseName").addClass('warningBorder')
        }else{
            $("#courseDay").addClass('warningBorder')
            $("#courseTime").addClass('warningBorder')
        }
        
    })
    // view result
    $("#viewResult").on("click",()=>{
        $("#courseName").removeClass('warningBorder')
        let courseID=$("#courseName").val()
        if(courseID){
            let courseKey=courseID.split('_')[1]
            console.log(courseKey)
            window.location.href="result.html?course="+courseKey
        }else{
            $("#courseName").addClass('warningBorder')
        }
    })
    // save course infor
    $("#saveCourse").on('click',()=>{
        let courseID = $("#courseName").val()
        let timeOptions = []
        //remove the red border if there is
        $("#courseName").removeClass('warningBorder')
        $("#courseDay").removeClass('warningBorder')
        $("#courseTime").removeClass('warningBorder')

        $("#timeList").children().each(function(){
            console.log("aaaa")
            let courseDay = $(this).text().split(' ')[0]
            let courseTime = $(this).text().split(' ')[1]
            let dayKey=Object.keys(dayTime).find(key => dayTime[key] === courseDay);
            let timeKey=Object.keys(hourTime).find(key => hourTime[key] === courseTime);
            timeOptions.push(dayKey+'_'+timeKey)
        })
        timeOptions.sort()
        console.log(timeOptions)
        if(courseID==''){
            $("#courseName").addClass('warningBorder')
        }
        else if(timeOptions.length==0){
            $("#courseDay").addClass('warningBorder')
            $("#courseTime").addClass('warningBorder')
        }else{
            db.ref("course").get().then((snapshot)=>{
                for(let [key, value] of Object.entries(snapshot.val())){
                    if(key==courseID){
                        db.ref("course").child(key).update({timeOptions: timeOptions}).then(()=>{
                            $("#confirmModal").find(".modal-body").find("p").text("Saved !")
                            $("#confirmModal").modal();
                        })
                    }
                }
            })
        }
    })
    $('#deleteCourse').on('click', ()=>{
        let courseID = $("#courseName").val()
        if(courseID==''){
            $("#courseName").addClass('warningBorder')
        }else{
            $("#deleteModal").find(".modal-body").find("p").text("Are you sure to delete this course ?")
            $("#deleteModal").modal();
        }
    })

    // for delete
    $('#okButton').on('click', ()=>{
        let courseID = $("#courseName").val()
        // delete the student infor for this course
        db.ref('enroll').get().then((snapshot)=>{
            console.log(snapshot.val())
            for(let [key, value] of Object.entries(snapshot.val())){
                console.log(key, value)
                if(value.courseID==courseID){
                    db.ref("enroll").child(key).remove()
                }
            }
        })
        // delete this course 
        db.ref('course').child(courseID).remove().then(()=>{
            location.reload()
        })
    })
})

const getRandomKey = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 28;
    let randomStr = "";
    for (let i = 0; i < length; i++) {
      const randomNum = Math.floor(Math.random() * characters.length);
      randomStr += characters[randomNum];
    }
    return randomStr;
  };