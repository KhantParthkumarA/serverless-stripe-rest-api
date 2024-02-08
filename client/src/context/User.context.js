import { createContext, useState } from 'react';

const [user, setUser] = useState({ isPlanSuggested: false })

const UserContext = createContext({
  user,
  setUserName: (data) => {
    setUser(data)
  },
});

export {
    UserContext
}