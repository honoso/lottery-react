import React, { useEffect, useState } from 'react';
import web3 from './web3';
import lottery from './lottery';

const App = () => {
  const [manager, setManager] = useState('');
  const [players, setPlayers] = useState([]);
  const [totalPot, setTotalPot] = useState('');
  const [etherValue, setEtherValue] = useState('');
  const [message, setMessage] = useState('');
  const [winnerMessage, setWinnerMessage] = useState('');

  const inputStyle = {
    backgroundColor: 'transparent',
    border: '.2rem solid black',
    fontSize: '1.4rem',
    fontWeight: '700',
    padding: '.5rem 3rem',
    outline: 'none',
    cursor: 'pointer',
  };

  useEffect(() => {
    const getData = async () => {
      setPlayers(await lottery.methods.getPlayers().call());
      setManager(await lottery.methods.manager().call());
      setTotalPot(await web3.eth.getBalance(lottery.options.address));
    };
    getData();
  }, []);

  const enterLotteryHandler = async (e) => {
    e.preventDefault();

    // Check if valid number
    if (!parseFloat(etherValue)) return;

    // Get account and set message
    const accounts = await web3.eth.getAccounts();
    setMessage('Waiting on Transaction Success...');

    // Process transaction
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(etherValue, 'ether'),
        gas: '1000000',
        gasPrice: '5000000000',
      });
    } catch (error) {
      setMessage(
        'There was an error with the transaction. Please try again later'
      );
      return;
    }

    setMessage('Entered Lottery Successfully!!!');
    setPlayers(await lottery.methods.getPlayers().call());
    setTotalPot(await web3.eth.getBalance(lottery.options.address));
    setEtherValue('');
  };

  const pickWinnerHadler = async (e) => {
    e.preventDefault();

    // Get current account
    const accounts = await web3.eth.getAccounts();

    // Check to see if there are no players
    // or if someone else besides the manager clicked
    if (players.length === 0 || accounts[0] !== manager) return;
    setWinnerMessage('Picking A Winner...');

    // Pick a winner
    try {
      await lottery.methods.pickWinner().send({
        from: manager,
        gas: '1000000',
        gasPrice: '5000000000',
      });
    } catch (error) {
      setMessage(
        'There was an error with the transaction. Please try again later'
      );
      return;
    }

    // Set message and reset players/totalPot
    const winner = await lottery.methods.lastWinner().call();
    setWinnerMessage(`${winner} HAS WON!!!`);
    setPlayers([]);
    setTotalPot('');
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <h1>Lottery Contract</h1>
      <h2>This Contract is managed by: {manager}</h2>
      <h2>
        {players.length === 1
          ? `There is currently 1 player entered, competing to win ${web3.utils.fromWei(
              totalPot,
              'ether'
            )} ether`
          : `There are currently ${
              players.length
            } players entered, competing to win ${web3.utils.fromWei(
              totalPot,
              'ether'
            )} ether`}
      </h2>
      <h2>Want to try your luck?</h2>
      <form>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <h3>Amount of ether to enter</h3>
          <input
            type="number"
            name="ether"
            min="0"
            style={inputStyle}
            placeholder="0"
            value={etherValue}
            onChange={(e) => {
              setEtherValue(e.target.value);
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <input
            type="submit"
            name="submit"
            value="Enter"
            style={inputStyle}
            onClick={enterLotteryHandler}
          />
          <h2>{message}</h2>
        </div>
      </form>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h3>Time to pick a winner?</h3>
        <input
          type="submit"
          name="pick"
          value="Pick a Winner!"
          style={inputStyle}
          onClick={pickWinnerHadler}
        />
        <h1>{winnerMessage}</h1>
      </form>
    </div>
  );
};

export default App;
