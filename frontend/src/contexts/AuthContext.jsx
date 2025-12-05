import React, { createContext, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// For debugging
const _promos = [
  {
    id: 1,
    name: "Double Points Weekend",
    description: "Earn 2x points on all purchases this weekend!",
    type: "MULTIPLIER",
    startTime: "2025-11-29T00:00:00.000Z",
    endTime: "2025-12-01T23:59:59.000Z",
    minSpending: null,
    rate: 2.0,
    points: null,
    user: [],
    transactions: []
  },
  {
    id: 2,
    name: "New Member Bonus",
    description: "Get 500 bonus points when you sign up today",
    type: "BONUS",
    startTime: "2025-11-01T00:00:00.000Z",
    endTime: null,
    minSpending: null,
    rate: null,
    points: 500,
    user: [],
    transactions: []
  },
  {
    id: 3,
    name: "Spend $50, Get 200 Points",
    description: "Make a purchase of $50 or more and earn 200 bonus points",
    type: "THRESHOLD",
    startTime: "2025-11-20T00:00:00.000Z",
    endTime: "2025-12-20T23:59:59.000Z",
    minSpending: 50,
    rate: null,
    points: 200,
    user: [],
    transactions: []
  },
  {
    id: 4,
    name: "Holiday Triple Points",
    description: "Triple points on all purchases during the holiday season",
    type: "MULTIPLIER",
    startTime: "2025-12-15T00:00:00.000Z",
    endTime: "2026-01-05T23:59:59.000Z",
    minSpending: null,
    rate: 3.0,
    points: null,
    user: [],
    transactions: []
  },
  {
    id: 5,
    name: "Flash Sale - 1000 Points",
    description: "Limited time offer! Get 1000 points instantly",
    type: "BONUS",
    startTime: "2025-11-27T12:00:00.000Z",
    endTime: "2025-11-28T12:00:00.000Z",
    minSpending: null,
    rate: null,
    points: 1000,
    user: [],
    transactions: []
  }
];

const _events = [
  {
    id: 1,
    name: "Rewards Rally",
    description: "Kick off the season with bonus points, live demos, and swag.",
    startTime: "2025-11-27T18:41:14.703Z",
    endTime: "2025-12-27T18:41:14.703Z",
    location: "BA 1160"
  },
  {
    id: 2,
    name: "VIP Tasting Night",
    description: "Invite-only tasting with partners, points multipliers, and perks.",
    startTime: "2025-11-27T18:41:14.703Z",
    endTime: "2025-12-27T18:41:14.703Z",
    location: "BA 3185"
  },
];


/*
 * This provider should export a `user` context state that is
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewRole, setViewRole] = useState(null); // null means use actual user role
    const [ events, setEvents ] = useState([]);
    const [ myEvents, setMyEvents ] = useState([]);
    const [ promotions, setPromotions ] = useState([]);
    const [ myPromotions, setMyPromotions ] = useState([]);
    const [ transactions, setTransactions ] = useState([]);
    const [myTransactions, setMyTransactions] = useState([]);

    const toQueryString = (obj) => {
      return '?' + Object.entries(obj)
        .filter(([key, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    }


  const getEvents = async (f) => {
        const token = localStorage.getItem("token");
        const query = toQueryString(f);
        console.log(query)
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/events${query}`, {
            method: "GET",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        });
        const body = await res.json();
        console.log(body);
        return body;

  }

    const getEvent = async (id) => {
        const token = localStorage.getItem("token");
        const query = toQueryString({id: id});
        console.log(query)
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/events${query}`, {
            method: "GET",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        });
        const body = await res.json();
        console.log(body);
        return body?.results?.filter(e => e.id === id);

    }

  const addEvent = async (e) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/events`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(e)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      // Refresh local state after creating
      await refreshEvents(token);

      return data;
  };

    const updateEvent = async (id, updates) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        throw new Error(text || "Failed to update event");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to update event");
      }

      console.log(data)
      // Refresh local state after updating
      await refreshEvents(token);

      // Also patch local state immediately so UI feels instant
      setEvents((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, ...data } : ev))
      );
      setMyEvents((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, ...data } : ev))
      );
      console.log(events)

      return data;
    };

    const getPromotion = async (id) => {
        const token = localStorage.getItem("token");
        const query = toQueryString({id: id});
        console.log(query)
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/promotions${query}`, {
            method: "GET",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        });
        const body = await res.json();
        console.log(body);
        return body;

    }

    const deleteEvent = async (id, password) => {
        const token = localStorage.getItem("token");
        if (!token) return { success: false, error: "Not authenticated" };
        const res = await fetch(`${BACKEND_URL}/events/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
        });
        if (!res.ok) {
            let data;
            try { data = await res.json(); } catch (err) { data = {}; }
            return { success: false, error: data.error || "Failed to delete event" };
        }
        await refreshEvents(token);
        return { success: true };
    }

    const preparePromotionPayload = (p) => {
      return {
        ...p,
        type: p.type?.toLowerCase(),                     // lowercase type
        startTime: new Date(p.startTime).toISOString(),  // ISO string
        endTime: new Date(p.endTime).toISOString(),      // ISO string
        minSpending: p.minSpending || null,             // optional numeric
        rate: p.rate || null                             // optional numeric
      };
    };
    const addPromotion = async (p) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/promotions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(preparePromotionPayload(p))
        });
        const data = await res.json();
        console.log(data)
        if (!res.ok) throw new Error(data.error || "Failed to create promotion");
        await refreshPromotions(token);
        return data;
    }

    const updatePromotion = async (id, updates) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/promotions/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update promotion");
        await refreshPromotions(token);
        return data;
    }

    const deletePromotion = async (id, password) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/promotions/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
        });
        if (!res.ok) {
            let data;
            try { data = await res.json(); } catch (e) { data = {}; }
            throw new Error(data?.error || "Failed to delete promotion");
        }
        await refreshPromotions(token);
    }

    const addMyEvent = (e) => {
        console.log(myEvents, e);
        if (myEvents.some(event => event.id === e.id)) {
          console.log('Event already exists!');
          return;
        }
        setMyEvents([...myEvents, e])
    }

    const rsvpEvent = async (id) => {
        console.log(user.utorid)
        const token = localStorage.getItem("token");
        if (!token) return; console.log("here")
        const res = await fetch(`${BACKEND_URL}/events/${id}/guests`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ utorid: user.utorid })
        });
    }

    const unRSVPEvent = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return false;
        try {
            console.log("Attempting to cancel RSVP from backend for event ID:", id);
            const res = await fetch(`${BACKEND_URL}/events/${id}/guests/me`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
            console.log("Backend response status:", res.status);
            if (res.ok) {
                setMyEvents((prevMyEvents) => prevMyEvents.filter(e => e.id !== id));
                return true;
            } else {
                const errorText = await res.text();
                console.error("Backend error:", res.status, errorText);
                return false;
            }
        } catch (error) {
            console.error("Error un-RSVPing from event:", error);
            return false;
        }
    }

    const addMyPromotions = (e) => {
        console.log(myEvents, e);
        if (myPromotions.some(event => event.id === e.id)) {
          console.log('Event already exists!');
          return;
        }
        setMyPromotions([...myPromotions, e])
    }

    const applyPromotion = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/promotions/${id}/apply`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        let data;
        try {
            data = await res.json();
        } catch (e) {
            const text = await res.text();
            throw new Error(text || "Failed to apply promotion");
        }
        if (!res.ok) {
            throw new Error(data.error || "Failed to apply promotion");
        }
        setMyPromotions((prev) => {
            if (prev.some(p => p.id === data.id)) return prev;
            return [...prev, data];
        });
        return data;
    };

    const getPromotions = (f) => {
        return promotions;
    }

    const processTransaction = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/transactions/${id}/processed`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            body: JSON.stringify({ processed: true })
        });

        console.log(await res.json())

    }

    const makeTransfer = async (id, t) => {
        console.log(id)
        console.log(t)
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/users/${id}/transactions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(t)
        });
        let data;
        try {
            data = await res.json();
        } catch (e) {
            const text = await res.text();
            throw new Error(text || "Failed to apply promotion");
        }
        if (!res.ok) {
            throw new Error(data.error || "Failed to apply promotion");
        }
        setMyTransactions((prev) => {
            if (prev.some(p => p.id === data.id)) return prev;
            return [...prev, data];
        });
        return data;

    }

    const getTransactions = async (f) => {
        const token = localStorage.getItem("token");
        const query = toQueryString(f);
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/transactions${query}`, {
            method: "GET",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        });
        return transactions;
    }

    const getTransaction = async (id) => { // todo hook up with db
        console.log(`id: ${id}`)
        const tx = transactions.filter(tx => tx.id === parseInt(id))[0];
        console.log(tx)
        if (tx) {
            return tx;
        }
        const activeRole = viewRole || user?.role || "user";
        const token = localStorage.getItem("token");
        if (!token) return;

        if (activeRole === 'manager' || activeRole === 'superuser') {
            console.log("foo")
            const res = await fetch(`${BACKEND_URL}/transactions/${id}`, {
                method: "GET",
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            });
            const body = await res.json();
            return body;
        } else {
            const query = toQueryString({id: id});
            console.log(toQueryString({id}));
            const res = await fetch(`${BACKEND_URL}/users/me/transactions${query}`, {
                method: "GET",
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            });
            const body = await res.json();
            console.log("body")
            console.log(body);
            return body.results[0];
        }

    }

    const getMyTransactions = async (f) => {
        const token = localStorage.getItem("token");
        const query = toQueryString(f);
        console.log(query)
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/users/me/transactions${query}`, {
            method: "GET",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        });
        const body = await res.json();
        console.log(body);
        return body;
    }

    const addTransaction = async (t) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(t)
        });
        let data;
        try { data = await res.json(); } catch (e) { data = {}; }
        if (!res.ok) throw new Error(data.error || "Failed to add transaction");
        await refreshTransactions(token);
        return data;
    }

    const updateTransaction = async (id, updates) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/transactions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(updates)
        });
        let data;
        try { data = await res.json(); } catch (e) { data = {}; }
        if (!res.ok) throw new Error(data.error || "Failed to update transaction");
        await refreshTransactions(token);
        return data;
    };

    const deleteTransaction = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/transactions/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
            let data;
            try { data = await res.json(); } catch (e) { data = {}; }
            throw new Error(data.error || "Failed to delete transaction");
        }
        await refreshTransactions(token);
    };

    const addMyTransaction = async (t) => {

        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/users/me/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(t)
        });
        let data;
        try { data = await res.json(); } catch (e) { data = {}; }
        if (!res.ok) throw new Error(data.error || "Failed to add transaction");
        await refreshTransactions(token);
        setMyTransactions((prev) => {
          if (prev.some(transaction => transaction.id === res.id)) {
            return prev;
          }
          return [...prev, t];
        });
        return data;
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            navigate("/login#login-form");
            return;
        }
        fetch(`${BACKEND_URL}/users/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(async (res) => {
            if (!res.ok) throw new Error(await res.json().then(d => d.error || "Failed to load profile"));
            return res.json();
        })
        .then((data) => setUser(data.user))
        .catch(() => {
            localStorage.removeItem("token");
            setUser(null);
            navigate("/login#login-form");
        })
        .finally(() => setLoading(false));
    }, []);

    const refreshEvents = (tokenOverride = null) => {
        const token = tokenOverride || localStorage.getItem("token");
        if (!token) return;
        return fetch(`${BACKEND_URL}/events?limit=200`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.results) {
                setEvents(data.results);
                if (user?.utorid) {
                    setMyEvents(data.results.filter((e) => (e.guests || []).some(g => g.utorid === user.utorid)));
                } else {
                    setMyEvents([]);
                }
            }
          })
          .catch(() => {});
    };

    // Load events/promotions/transactions from backend when logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        refreshEvents(token);
        refreshPromotions(token);
        refreshTransactions(token);
    }, [user]);

    const refreshPromotions = (tokenOverride = null) => {
        const token = tokenOverride || localStorage.getItem("token");
        if (!token) return;
        return fetch(`${BACKEND_URL}/promotions?limit=200`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.results) {
                setPromotions(data.results);
                if (user?.utorid) {
                    setMyPromotions(data.results.filter((p) => (p.user || []).some(u => u.utorid === user.utorid)));
                } else {
                    setMyPromotions([]);
                }
            }
          })
          .catch(() => {});
    };

    const refreshTransactions = (tokenOverride = null) => {
        const token = tokenOverride || localStorage.getItem("token");
        if (!token) return;
        return fetch(`${BACKEND_URL}/transactions?limit=200`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.results) {
                setTransactions(data.results);
                if (user?.utorid) {
                    setMyTransactions(data.results.filter((t) => t.utorid === user.utorid));
                } else {
                    setMyTransactions([]);
                }
            }
          })
          .catch(() => {});
    };


    /*
     * Switch the view role to see the app from different user perspectives.
     * @param {string|null} role - The role to switch to, or null for actual user role
     */
    const switchViewRole = (role) => {
        setViewRole(role);
    };

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setViewRole(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @param {string|object} username - The username/utorid or an object containing credentials.
     * @param {string} password - The password of the user (optional if included in object).
     * @returns {string|null} - Upon failure, returns an error message; on success, null.
     */
    const login = async (username, password) => {
        try {
            const utorid = typeof username === "object" ? (username.utorid || username.email || username.username) : username;
            const pwd = typeof username === "object" ? username.password : password;
            const res = await fetch(`${BACKEND_URL}/auth/tokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" , credentials: 'include' },
                body: JSON.stringify({ utorid, password: pwd })
            });
            const data = await res.json();
            if (!res.ok) {
                return "Incorrect utorid or password. Please try again.";
            }
            localStorage.setItem("token", data.token);

            const meRes = await fetch(`${BACKEND_URL}/users/me`, {
                headers: { "Authorization": `Bearer ${data.token}`,
                            credentials: 'include'
                  }
            });
            const me = await meRes.json();
            if (!meRes.ok) {
                return "Incorrect utorid or password. Please try again.";
            }
            setUser(me.user);
            return null;
        } catch (err) {
            return err.message || "Login failed";
        }
    };
    /**
     * Registers a new user.
     *
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async ({ username, firstname, lastname, password }) => {
        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, firstname, lastname, password }),
            });

            const data = await res.json();

            if (!res.ok) return data.message; // return error message

            navigate("/success"); // redirect after successful registration
            return null;
        } catch (err) {
            return err.message || "Registration failed";
        }
    };

    const addUserToEvent = async (eId, uId) => {
        console.log(eId, uId);
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/events/${eId}/guests`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({utorid: uId})
        });
    }

    const awardPointsToGuest = async (eId, uId, amount, remark) => {
        const e = await getEvent(eId);
        console.log(e, amount, remark)
        if (!e) return;

        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/events/${eId}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({type: "event", utorid: uId?uId:null, amount: Number(amount), remark: remark?remark:null})
        });

        console.log(await res.json())
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading,
            viewRole, switchViewRole,
            myEvents, addMyEvent, events, addEvent, updateEvent, deleteEvent, getEvents, rsvpEvent, unRSVPEvent, getEvent, addUserToEvent, awardPointsToGuest,
            myPromotions, promotions, addPromotion, addMyPromotions, getPromotions, getPromotion,
            applyPromotion, updatePromotion, deletePromotion,
            myTransactions, transactions, addTransaction, addMyTransaction, getTransactions, getTransaction, getMyTransactions,
            updateTransaction, deleteTransaction,processTransaction, makeTransfer

        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
