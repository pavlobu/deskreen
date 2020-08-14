import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '@blueprintjs/core';
import styles from './Counter.css';
import routes from '../../constants/routes.json';
import {
  increment,
  decrement,
  incrementIfOdd,
  incrementAsync,
  selectCount,
} from './counterSlice';

export default function Counter() {
  const dispatch = useDispatch();
  const value = useSelector(selectCount);
  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <br />
        <Link to={routes.HOME}>
          <Button icon="arrow-left" />
        </Link>
      </div>
      <h1
        className={`bp3-heading counter ${styles.counter}`}
        data-tid="counter"
      >
        {value}
      </h1>
      <div className={styles.btnGroup}>
        <Button
          className={styles.btn}
          onClick={() => {
            dispatch(increment());
          }}
          data-tclass="btn"
          type="button"
        >
          <i className="fa fa-plus" />
        </Button>
        <Button
          className={styles.btn}
          onClick={() => {
            dispatch(decrement());
          }}
          data-tclass="btn"
          type="button"
        >
          <i className="fa fa-minus" />
        </Button>
        <Button
          className={styles.btn}
          onClick={() => {
            dispatch(incrementIfOdd());
          }}
          data-tclass="btn"
          type="button"
        >
          odd
        </Button>
        <Button
          className={styles.btn}
          onClick={() => {
            dispatch(incrementAsync());
          }}
          data-tclass="btn"
          type="button"
        >
          async
        </Button>
      </div>
    </div>
  );
}
