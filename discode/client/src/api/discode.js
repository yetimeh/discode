class DiscodeAPI {
    constructor () {
        this.url = "http://localhost:5000";
    }

    createNewProject (data) {
       
        return new Promise((resolve, reject) => {fetch(this.url+"/projects/create" , {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((value) => {
            
            value.text().then((_data) => {
               resolve(_data);
            })
        })})

    }

    async fetchRecentProjects() {
        const response = await fetch(this.url+"/projects/recent", {
            method: "GET"
        })

        const data = await response.json();

        return data;
    }

    async fetchComponents() {
        const response = await fetch(this.url+"/components", {
            method: "GET"
        })


        return await response.json()
    }

    reloadCommands (path, project_name) {
        return new Promise((resolve, reject) => {fetch(this.url+"/commands/reload/"+encodeURIComponent(path)+"?project_name="+encodeURIComponent(project_name) , {
            method: "GET",
            
        }).then((value) => {
            
            value.text().then((_data) => {
               resolve(_data);
            })
        })})
    }

    renameExtension (data) {
        
        return new Promise((resolve, reject) => {fetch(this.url+"/extensions/rename" , {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((value) => {
            
            value.text().then((_data) => {
               resolve(_data);
            })
        })})
    }

    deleteExtension (data) {
        
        return new Promise((resolve, reject) => {fetch(this.url+"/extensions/delete" , {
            method: "DELETE",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((value) => {
            
            value.text().then((_data) => {
               resolve(_data);
            })
        })})
    }

    getProject (path) {
        console.log("PATH", path)

        return new Promise((resolve, reject) => {fetch(this.url+"/projects/get", {
            method: "POST",
            body: JSON.stringify({ path : path}),
            headers: {
                "Content-Type": "application/json"
            }
        

        }).then((value) => {
            console.log("value: ",value)


            value.json().then((_data) => {
                resolve(_data)
            })
        })
    })
    }

    getExtension (path, name) {
        return new Promise((resolve, reject) => {fetch(this.url+"/extensions/get", {
            method: "POST",
            body: JSON.stringify({ path, name}),
            headers: {
                "Content-Type": "application/json"
            }
        

        }).then((value) => {
            console.log(value)

            value.json().then((_data) => {
                

                resolve(_data)
            })
        })
    })
    }

    createExtension (data) {
        return new Promise((resolve, reject) => {fetch(this.url+"/extensions/create", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        

        }).then((value) => {
            console.log(value)

            value.json().then((_data) => {
                

                resolve(_data)
            })
        })
    })
    }

    // stopBot () {
        
    //     return new Promise((resolve, reject) => {fetch(this.url+"/bot/stop" , {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json"
    //         }
    //     }).then((value) => {
            
    //         value.text().then((_data) => {
    //            resolve(_data);
    //         })
    //     })})
    // }


    
}

export default DiscodeAPI;