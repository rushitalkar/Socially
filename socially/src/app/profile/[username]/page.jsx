const profile = async({params})=>{
    console.log(params);

    // This delay suspends the page, so loading.jsx is shown until it resolves.
    await new Promise((resolve)=> setTimeout(resolve , 3000))
    
    
    return(
       <div>
           <h1>Profile Page</h1>
       </div>
    )
}

export default profile