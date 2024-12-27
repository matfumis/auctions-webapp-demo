const { createApp } = Vue

const app = createApp({

  data() {
    return {
      authenticated: false,
      userInfo: {},
      auctions: {},
      users: {},
      userCreatedAuctions: {},
      signinData: {
        username: '',
        password: ''
      },
      signupData: {
        username: '',
        name: '',
        surname: '',
        password: ''
      },
      newAuction: {
        title: '',
        description: '',
        startPrice: '',
        endTime: ''
      },
      editedAuction: {
        title: '',
        description: '',
      },
      newBid: {
        amount: ''
      },

      auctionsQuery: '',
      onlyOpenAuctions: false,
      usersQuery: '',
      selectedAuction: '',
      selectedUserId: '',

      showAuctionsFilters: false,
      showNewAuctionForm: false,
      showNewBidForm: false,
      showMoreUserInfo: false,
      showBidsHistory: false,
      showEditAuctionForm: false,
      showSignupForm: false,

      showPersonalArea: false,
      showAuctionsArea: true,
      showUsersArea: false,
    }
  },

  mounted() {
    this.fetchUserInfo();
    this.fetchAuctions();

  },

  methods: {

    toggleLoginForm() {
      this.showLoginForm = !this.showLoginForm;
    },

    toggleNewAuctionForm() {
      this.showNewAuctionForm = !this.showNewAuctionForm;
    },

    toggleBidsHistory(auctionId) {
      if (this.selectedAuction === auctionId && this.showBidsHistory) {

        this.showBidsHistory = false;
        this.selectedAuction = null;
      } else {

        this.showBidsHistory = true;
        this.showNewBidForm = false;
        this.selectedAuction = auctionId;
      }
    },

    toggleEditAuctionForm(auctionId) {
      if (this.selectedAuction === auctionId && this.showEditAuctionForm) {

        this.showEditAuctionForm = false;
        this.selectedAuction = null;
      } else {

        this.showEditAuctionForm = true;
        this.selectedAuction = auctionId;
      }
    },

    toggleNewBidForm(auctionId) {
      if (this.selectedAuction === auctionId && this.showNewBidForm) {

        this.showNewBidForm = false;
        this.selectedAuction = null;
      } else {

        this.showNewBidForm = true;
        this.showBidsHistory = false;
        this.selectedAuction = auctionId;
      }
    },

    togglePersonalArea() {
      this.showPersonalArea = !this.showPersonalArea;
      this.showUsersArea = false;
      this.showAuctionsArea = true
    },

    toggleAuctionsArea() {
      this.showAuctionsArea = true
      this.showUsersArea = false;
      this.showPersonalArea = false;
    },

    toggleUsersArea() {
      this.showUsersArea = !this.showUsersArea;
      this.showPersonalArea = false;
      this.showAuctionsArea = true
    },

    toggleMoreUserInfo(userId) {
      this.selectedUserId = this.selectedUserId === userId ? null : userId;
    },

    toggleSignupForm() {
      this.showSignupForm = !this.showSignupForm;
    },


    signup() {
      fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.signupData)
      }).then(async res => {
        const { msg } = await res.json();
        if (res.ok) {
          alert(msg);
          this.showSignupForm = false;
          this.signupData = {};
        } else {
          alert('Some fields are not valid');
          this.signupData = {};
        }
      }).catch(err => {
        console.log(err);
      })

    },

    signin() {
      fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.signinData)
      }).then(async res => {
        const { msg } = await res.json();
        if (res.ok) {
          this.authenticated = true;
          this.toggleLoginForm();
          this.signinData = {};
          alert(msg);
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = "/";
        } else {
          alert(msg);
          this.signinData = {};
        }
      }).catch(err => {
        console.log(err);
      })
    },

    async fetchUserInfo() {
      fetch('/api/whoami', {
        method: 'GET',
        credentials: 'include'
      }).then(async res => {
        if (res.ok) {
          this.authenticated = true;
          this.userInfo = await res.json();
        } else {
          this.authenticated = false;
          this.userInfo = {};
        }
      }).catch(err => {
        console.log(err);
      })
    },

    async fetchAuctions() {
      if (this.auctionsQuery === '') {
        fetch('/api/auctions', {
          method: 'GET'
        }).then(async res => {

          let data = await res.json();

          if (this.onlyOpenAuctions) {
            this.auctions = data.filter(auction => auction.open === true);
          } else {
            this.auctions = data;
          }
        }).catch(err => {
          console.log(err);
        })
      } else {
        fetch(`/api/auctions?q=${encodeURIComponent(this.auctionsQuery)}`, {
          method: 'GET'
        }).then(async res => {
          this.auctions = await res.json();
          this.auctionsQuery = '';
        }).catch(err => {
          console.log(err);
        });
      }
    },

    async fetchUserCreatedAuctions() {
      const userAuctionsResponse = await fetch(`/api/auctions?q=${encodeURIComponent(this.userInfo.id)}`, {
        method: 'GET'
      });
      this.userCreatedAuctions = await userAuctionsResponse.json();
      await this.fetchAuctions();
    },

    async fetchUsers() {
      if (this.usersQuery.trim() === '') {
        fetch('/api/users', {
          method: 'GET'
        }).then(async res => {
          this.users = await res.json();
        }).catch(err => {
          console.log(err);
        });
      } else {
        fetch(`/api/users?q=${encodeURIComponent(this.usersQuery)}`, {
          method: 'GET'
        }).then(async res => {
          this.users = await res.json();
          this.usersQuery = '';
        }).catch(err => {
          console.log(err);
        });
      }
    },

    createAuction() {
      fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(this.newAuction)
      }).then(async res => {
        const { msg } = await res.json();
        if (res.ok) {
          alert(msg);
          await this.fetchAuctions();
          this.toggleNewAuctionForm();
          this.newAuction = {};
        } else {
          alert(msg);
        }
      }).catch(err => {
        console.log(err);
      });
    },

    async deleteAuction(id) {
      fetch(`/api/auctions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(async res => {
        const { msg } = await res.json();
        if (res.ok) {
          alert(msg);
          await this.fetchUserCreatedAuctions();
        } else {
          alert(msg);
        }
      }).catch(err => {
        console.log(err);
      })
    },


    async editAuction(id) {
      fetch(`/api/auctions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(this.editedAuction)
      }).then(async res => {
        const { msg } = await res.json();
        if (res.ok) {
          await this.fetchUserCreatedAuctions();
          alert(msg);
          this.toggleEditAuctionForm(id);

        }
      }).catch(err => {
        console.log(err);
      })
    },


    makeNewBid() {
      fetch(`/api/auctions/${encodeURIComponent(this.selectedAuction)}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(this.newBid)
      }).then(async res => {
        const message = await res.text();
        if (res.ok) {
          alert(message);
          this.toggleNewBidForm();
          this.newBid.amount = '';
          await this.fetchAuctions();
        } else {
          alert(message);
          this.newBid.amount = '';
          await this.fetchAuctions();
        }
      }).catch(err => {
        console.log(err);
      })
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('en-EN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    isAuctionOpen(date) {
      const now = new Date();
      const endTime = new Date(date);
      return now < endTime;
    },

    printStatus(status) {
      return {
        text: status ? 'open' : 'expired',
        color: status ? 'green' : 'red',
      };
    }
  }
});

app.mount('#app');