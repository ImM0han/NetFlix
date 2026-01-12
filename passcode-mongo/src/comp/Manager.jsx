import React from 'react'
import toast from 'react-hot-toast'
import { useRef, useState, useEffect } from 'react'
const Manager = () => {
  const passwordRef = useRef()
  const showPassword = () => {
    if (passwordRef.current) {
      passwordRef.current.type =
        passwordRef.current.type === "password" ? "text" : "password";
    }
  };

  const [passwordArray, setpasswordArray] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setform] = useState({ link: "", site: "", username: "", password: "" })
  
  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
  }
  
const editPassword = (id) => {
  console.log("Editing Password with id", id);
  const passwordToEdit = passwordArray.find(item => item._id === id);
  if (passwordToEdit) {
    setform(passwordToEdit); 
  }
};

  const handleDeletePassword = (id) => {
    console.log("Deleting Password with id", id);
    let c = confirm("do you really want to delete?")
    if (c) {
      try {
        setLoading(true);
        const updatedPasswords = passwordArray.filter(item => item._id !== id);
        localStorage.setItem('passwords', JSON.stringify(updatedPasswords));
        setpasswordArray(updatedPasswords);
        toast.success("Password Deleted");
      } catch (error) {
        toast.error("Failed to delete password");
        console.error("Delete error:", error);
      } finally {
        setLoading(false);
      }
    }
  };


  // Load passwords from local storage
  const loadPasswords = () => {
    try {
      setLoading(true);
      const storedPasswords = localStorage.getItem('passwords');
      if (storedPasswords) {
        setpasswordArray(JSON.parse(storedPasswords));
      } else {
        setpasswordArray([]);
      }
    } catch (error) {
      toast.error("Failed to load passwords");
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const savepassword = () => {
    // Check for duplicates
    const isDuplicate = passwordArray.some(
      (item) =>
        item.site.toLowerCase() === form.site.toLowerCase() &&
        item.username.toLowerCase() === form.username.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This site + username is already saved!");
      return;
    }

    try {
      setLoading(true);
      const newPassword = {
        ...form,
        _id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString()
      };
      
      const updatedPasswords = [...passwordArray, newPassword];
      localStorage.setItem('passwords', JSON.stringify(updatedPasswords));
      setpasswordArray(updatedPasswords);
      setform({ link: "", site: "", username: "", password: "" }); // Clear form
      toast.success("Password Saved");
    } catch (error) {
      toast.error("Failed to save password");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load passwords on component mount
  useEffect(() => {
    loadPasswords();
  }, []);
  return (
    <>

      <div className="container bg-gray-900 text-white flex flex-col items-center h-screen">


        <div className="input flex flex-col items-center w-120 py-5 my-5 rounded-2xl gap-5 h-80 bg-gray-700 shadow-lg border-2">
          <h1>Your Own Password Manager</h1>
          <input value={form.link} onChange={handleChange} name='link' type="text" placeholder="link" className="link p-2 rounded-full w-96 h-8 bg-gray-700 border border-gray-600 text-white focus:bg-gray-600 hover:font-bold hover:bg-gray-900 px-5 " />
          <input value={form.site} onChange={handleChange} name='site' type="text" placeholder="Website Name" className="site p-2 rounded-full w-56 h-8 bg-gray-700 border border-gray-600 text-white focus:bg-gray-600 hover:font-bold hover:bg-gray-900 px-5 " />
          <input value={form.username} onChange={handleChange} name='username' type="text" placeholder="Username" className="username p-2 rounded-full w-56 h-8 bg-gray-700 border border-gray-600 text-white focus:bg-gray-600 hover:font-bold hover:bg-gray-900 px-5 " />
          <div className="relative w-56">
            <input ref={passwordRef}
              value={form.password}
              onChange={handleChange}
              name="password"
              type="password"
              placeholder="password"
              className="password p-2 rounded-full w-full h-8 bg-gray-700 border border-gray-600 text-white 
               focus:bg-gray-600 hover:font-bold hover:bg-gray-900 px-5"
            />
            <span
              onClick={showPassword}
              className="absolute right-3 top-[20px] transform -translate-y-1/2 cursor-pointer"
            >
              <lord-icon
                src="https://cdn.lordicon.com/dicvhxpz.json"
                trigger="click"
                stroke="bold"
                state="hover-cross"
                colors="primary:#16c72e,secondary:#30e849"
                style={{ width: "25px", height: "25px" }}
              ></lord-icon>
            </span>
          </div>


          <div
            id="saveBtn"
            onClick={savepassword}
            className={`mt-[-10px] px-5 py-5 rounded-full ${loading ? 'bg-gray-400' : 'bg-slate-500'} text-white font-semibold shadow-md active:scale-95 transition-all border-2 w-42 h-10 flex items-center justify-center gap-1 cursor-pointer`}
          >
            <lord-icon
              src="https://cdn.lordicon.com/gzqofmcx.json"
              trigger="click"
              target="#saveBtn"
              colors="primary:#16c72e"
              style={{ width: 20, height: 20 }}
            />
            <button className="text-[14px] cursor-pointer" disabled={loading}>
              {loading ? 'Saving...' : 'Save Password'}
            </button>
          </div>



        </div>

        <div className="savepassword w-11/12 bg-white rounded-4xl shadow-lg p-2 mx-1 my-1 text-black flex flex-col items-center border-2 ">

          <div className="saved w-11/12 bg-white rounded-full px-5 mx-10 flex flex-row justify-baseline gap-50 h-12 ">
            <h1 className='flex flex-col w-2/5 bg-white rounded-full px-10 m-2 text-2xl '>Saved Passwords:</h1>

            <input
              type="text"
              placeholder="Enter Your Website Name or Username to Search"
              className="w-2/6 h-8 px-5 py-3 rounded-full bg-gray-500 text-white placeholder-gray-300 focus:outline-none hover:bg-gray-900 transition duration-300" />



          </div>
          {passwordArray.length === 0 ? (
            <p className="text-gray-600 mt-5 font-medium">No password to be shown</p>
          ) : (
            <div className="w-11/12 h-full bg-gray-200 rounded-2xl px-5 mx-auto my-4 border-2 overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                <thead className="bg-green-400 font-bold">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 w-[17%]">Website</th>
                    <th className="border border-gray-300 px-4 py-2 w-[30%]">Link</th>
                    <th className="border border-gray-300 px-4 py-2 w-[22%]">Username</th>
                    <th className="border border-gray-300 px-4 py-2 w-[20%]">Password</th>
                    <th className="border border-gray-300 px-4 py-2 text-center w-[10%]">Actions</th>
                  </tr>

                </thead>
                <tbody>
                  {passwordArray.map((item, index) => {

                    return <tr key={index} className="hover:bg-gray-50 transition ">
                      <td className="border border-gray-300 px-4 py-2 bg-slate-400">
                        <div className='flex flex-row justify-between items-center'>
                          <span>{item.site}</span>
                          <div className="copy cursor-pointer size-7" onClick={() => {
                            navigator.clipboard.writeText(item.site);
                          }}>
                            <lord-icon
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="click"
                              style={{ width: "20px", height: "20px" }} className="bg-green-500">
                            </lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <a
                          href="https://example.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          <div className='flex flex-row justify-between items-center'>
                            <span>{item.link}</span>
                            <div className="copy cursor-pointer size-7" onClick={() => {
                              navigator.clipboard.writeText(item.link);
                            }}>
                              <lord-icon
                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                trigger="click"
                                style={{ width: "20px", height: "20px" }} className="bg-green-500">
                              </lord-icon>
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 bg-blue-200 ">
                        <div className='flex flex-row justify-between items-center'>
                          <span>{item.username}</span>
                          <div className="copy cursor-pointer size-7" onClick={() => {
                            navigator.clipboard.writeText(item.username);
                          }}>
                            <lord-icon
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="click"
                              style={{ width: "20px", height: "20px" }} className="bg-green-500">
                            </lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 bg-amber-200">
                        <div className='flex flex-row justify-between items-center'>
                          <span>{item.password}</span>
                          <div className="copy cursor-pointer size-7" onClick={() => {
                            navigator.clipboard.writeText(item.password);
                          }}>
                            <lord-icon
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="click"
                              style={{ width: "20px", height: "20px" }} className="bg-green-500">
                            </lord-icon>
                          </div>
                        </div>
                      </td>
                      <td>
                        
                        <button className="flex items-center justify-center gap-5 font-bold text-red-600 transition duration-200 ease-in-out hover:underline">
                          <span onClick={()=>{editPassword(item._id)}}>
                            <lord-icon
                            className="mx-2"
                            id="deleteIcon"
                            src="https://cdn.lordicon.com/exymduqj.json"
                            trigger="click"
                            stroke="bold"
                            state="hover-line"
                            colors="primary:#000000,secondary:#109121"
                            style={{ width: "20px", height: "20px" }}
                          ></lord-icon>

                          </span>
                          <span className="transition duration-100 ease-in-out transform active:scale-125" onClick={()=>{handleDeletePassword(item._id)}}>
                            Delete
                          </span>
                        </button>
                      </td>



                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          )}


        </div>

      </div>

    </>
  )
}

export default Manager
