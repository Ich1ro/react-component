import React, { useMemo, useState } from 'react';
import './App.css';

import { SelectPicker, Input, InputGroup, InputNumber, Slider } from 'rsuite';
import { LineChart, Line, Tooltip, Legend } from 'recharts';

function App() {
	const [accTypes, setAccTypes] = useState('Orbit');
	const [interestState, setInterestState] = useState('Monthly');
	const [deposit, setDeposit] = useState(50000);
	const [termState, setTermState] = useState('5');

	const accountTypes = useMemo(
		() =>
			['Orbit', 'Odyssey'].map(item => ({
				label: item,
				value: item,
			})),
		[]
	);

	const interests = useMemo(
		() =>
			['Monthly', 'Quarterly', 'Annually', 'Term'].map(item => ({
				label: item,
				value: item,
			})),
		[]
	);

	const terms = useMemo(
		() =>
			['5', '7', '10'].map(item => ({ label: `${item} Years`, value: item })),
		[]
	);

	const calcApy = () => {
		const orbitTable = {
			5: [5.5, 6, 7.5, 12],
			7: [7, 7.5, 9, 13.5],
			10: [7.5, 8, 9.5, 14],
		};

		const odysseyTable = {
			5: [6.5, 7, 8.5, 13],
			7: [7.5, 8, 9.5, 14],
			10: [8.5, 9, 10.5, 15],
		};

		const selectedTable = accTypes === 'Orbit' ? orbitTable : odysseyTable;

		let apyValue;

		if (interestState === 'Monthly') {
			apyValue = selectedTable[termState][0];
		} else if (interestState === 'Quarterly') {
			apyValue = selectedTable[termState][1];
		} else if (interestState === 'Annually') {
			apyValue = selectedTable[termState][2];
		} else if (interestState === 'Term') {
			apyValue = selectedTable[termState][3];
		}

		return apyValue;
	};

	const calcEarned = () => {
		const apy = calcApy();

		const interest = +deposit * (apy / 100) * +termState;

		const totalAmount = +deposit + +interest;

		return {
			interest: Number(interest.toFixed(2)),
			totalAmount: Number(totalAmount.toFixed(2)),
		};
	};

	const generateDataPoints = () => {
		const sortedDataPoints = [];
		switch (interestState) {
			case 'Monthly':
				for (let i = 1; i <= 12; i++) {
					const interest = calcEarned().interest;
					const totalAmount = +deposit + +interest;
					const value = Number(
						(+deposit + (totalAmount - deposit) * (i / 12)).toFixed(2)
					);
					sortedDataPoints.push({ title: `Month`, value });
				}
				break;
			case 'Quarterly':
				for (let i = 1; i <= 4; i++) {
					const interest = calcEarned().interest;
					const totalAmount = +deposit + +interest;
					const value = Number(
						(+deposit + (totalAmount - deposit) * (i / 4)).toFixed(2)
					);
					sortedDataPoints.push({ title: `Quarter`, value });
				}
				break;
			case 'Annually':
				for (let i = 1; i <= +termState; i++) {
					const interest = calcEarned().interest;
					const totalAmount = +deposit + +interest;
					const value = Number(
						(+deposit + (totalAmount - deposit) * (i / 3)).toFixed(2)
					);
					sortedDataPoints.push({ title: `Year`, value });
				}
				break;
			case 'Term':
				const interest = deposit * (calcApy() / 100) * termState;
				const totalAmount = deposit + interest;
				sortedDataPoints.push({ title: `Term`, value: totalAmount });
				break;
			default:
				return [];
		}
		return sortedDataPoints;
	};

	const dataPoints = useMemo(
		() => generateDataPoints(),
		[interestState, accTypes, interestState, deposit, termState]
	);

	const getXAxisDataKey = () => {
		switch (interestState) {
			case 'Monthly':
				return 'month';
			case 'Quarterly':
				return 'quarter';
			case 'Annually':
				return 'year';
			case 'Term':
				return 'year';
			default:
				return '';
		}
	};

	function CustomTooltip({ payload, label, active }) {
		if (active) {
			return (
				<div className='custom-tooltip'>
					<p className='label'>{`${payload[0].payload.title} - ${
						label + 1
					}`}</p>
					<p className='intro'>{`Interest - $${Number(
						payload[0].payload.value - +deposit
					).toFixed(0)}`}</p>
					<p className='desc'>{`Total - $${Number(
						payload[0].payload.value
					).toFixed(0)}`}</p>
				</div>
			);
		}

		return null;
	}

	return (
		<div className='app'>
			<div className='main'>
				<div className='main_left'>
					<div className='main_left_title'>
						Long term depository account details
					</div>
					<form className='main_left_form'>
						<div>
							<label>Account Type</label>
							<SelectPicker
								data={accountTypes}
								searchable={false}
								defaultValue={accTypes}
								style={{ width: '100%', opacity: 0.9 }}
								className='input-group'
								onChange={e => {
									if (e === 'Orbit') {
										setAccTypes(e);
										setDeposit(50000);
									} else {
										setAccTypes(e);
										setDeposit(100000);
									}
								}}
							/>
						</div>
						<div>
							<label>Interest</label>
							<SelectPicker
								data={interests}
								searchable={false}
								defaultValue={interestState}
								style={{ width: '100%', opacity: 0.9 }}
								className='input-group'
								onChange={e => {
									setInterestState(e);
								}}
							/>
						</div>
						<div>
							<label>Deposit Amount</label>
							<InputNumber
								prefix='$'
								className='input-group'
								defaultValue={deposit}
								min={accTypes === 'Orbit' ? 50000 : 100000}
								value={deposit}
								onChange={e => {
									setDeposit(e);
								}}
							/>
						</div>
						<div>
							<label>Term</label>
							<SelectPicker
								data={terms}
								searchable={false}
								defaultValue={termState}
								style={{ width: '100%' }}
								className='input-group'
								onChange={e => {
									setTermState(e);
								}}
							/>
						</div>
						<div className='main_left_form_apy'>
							<label>APY</label>
							<p>{calcApy()}%</p>
						</div>
					</form>
				</div>
				<div className='center'>
					<div className='center_line'></div>
				</div>
				<div className='main_right'>
					<div className='main_right_header_info'>
						<div className='main_right_header_info_earned'>
							<div className='main_right_header_info_earned_number'>{`$ ${
								calcEarned().interest
							}`}</div>
							<div className='main_right_header_info_earned_text'>
								Total Interest Earned
							</div>
						</div>
						<div className='main_right_header_info_balance'>
							<div className='main_right_header_info_balance_number'>{`$ ${
								calcEarned().totalAmount
							}`}</div>
							<div className='main_right_header_info_balance_text'>
								Total Balance
							</div>
						</div>
					</div>
					<div className='middle'>
						<div className='middle_line'></div>
					</div>
					<div className='main_right_stats'>
						<LineChart width={400} height={225} data={dataPoints}>
							{/* <XAxis dataKey={getXAxisDataKey()} />
							<YAxis /> */}
							<Tooltip content={<CustomTooltip />} />
							{/* <Legend /> */}
							<Line
								type='monotone'
								dataKey='value'
								stroke='#03feeb'
								fill='#03feeb'
								dot={{ r: 4, filter: 'url(#glow)' }}
							/>
							<defs>
								<filter id='glow' x='-50%' y='-80%' width='300%' height='300%'>
									<feGaussianBlur result='blur' stdDeviation='4' />
									<feMerge>
										<feMergeNode in='blur' />
										<feMergeNode in='SourceGraphic' />
									</feMerge>
								</filter>
							</defs>
						</LineChart>
					</div>
					<div className='middle'>
						<div className='middle_line'></div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
