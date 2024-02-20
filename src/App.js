import React, { useMemo, useState } from 'react';
import './App.css';

import { SelectPicker, Input, InputGroup } from 'rsuite';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
	const [accTypes, setAccTypes] = useState('Orbit');
	const [interestState, setInterestState] = useState('Monthly');
	const [deposit, setDeposit] = useState('50,000');
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
		const numericValue = parseFloat(deposit.replace(/,/g, ''));

		const interest = +numericValue * (apy / 100) * +termState;

		const totalAmount = +numericValue + +interest;

		return {
			interest: Number(interest.toFixed(2)),
			totalAmount: Number(totalAmount.toFixed(2)),
		};
	};

	const generateDataPoints = () => {
		const sortedDataPoints = [];
		const numericValue = parseFloat(deposit.replace(/,/g, ''));
		switch (interestState) {
			case 'Monthly':
				for (let i = 1; i <= 12; i++) {
					const interest = calcEarned().interest;
					const totalAmount = numericValue + +interest;
					const value = Number(
						(
							numericValue +
							(totalAmount - numericValue) * (i / +termState / 12)
						).toFixed(2)
					);
					sortedDataPoints.push({ title: `Month`, value });
				}
				break;
			case 'Quarterly':
				for (let i = 1; i <= 4; i++) {
					const interest = calcEarned().interest;
					const totalAmount = numericValue + +interest;
					const value = Number(
						(
							numericValue +
							(totalAmount - numericValue) * (i / +termState / 4)
						).toFixed(2)
					);
					sortedDataPoints.push({ title: `Quarter`, value });
				}
				break;
			case 'Annually':
				for (let i = 1; i <= +termState; i++) {
					const interest = calcEarned().interest;
					const totalAmount = numericValue + +interest;
					const value = Number(
						(
							numericValue +
							(totalAmount - numericValue) * (i / +termState)
						).toFixed(2)
					);
					sortedDataPoints.push({ title: `Year`, value });
				}
				break;
			case 'Term':
				const interest = numericValue * (calcApy() / 100) * termState;
				const totalAmount = numericValue + interest;
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

	function GenerateCenterInfo() {
		return (
			<>
				<div className='center-info-details'>
					<div className='main_right_header_info_earned_number'>
						${' '}
						{interestState === 'Monthly'
							? new Intl.NumberFormat('en-US').format(
									parseInt(calcEarned().interest / +termState / 12)
							  )
							: 0}
					</div>
					<div className='main_right_header_info_earned_text'>Monthly</div>
				</div>
				<div className='center-line'></div>
				<div className='center-info-details'>
					<div className='main_right_header_info_earned_number'>
						${' '}
						{interestState === 'Quarterly' || interestState === 'Monthly'
							? new Intl.NumberFormat('en-US').format(
									parseInt(calcEarned().interest / +termState / 4)
							  )
							: 0}
					</div>
					<div className='main_right_header_info_earned_text'>Quarterly</div>
				</div>
				<div className='center-line'></div>
				<div className='center-info-details'>
					<div className='main_right_header_info_earned_number'>
						${' '}
						{interestState === 'Annually' ||
						interestState === 'Quarterly' ||
						interestState === 'Monthly'
							? new Intl.NumberFormat('en-US').format(
									parseInt(calcEarned().interest / +termState)
							  )
							: 0}
					</div>
					<div className='main_right_header_info_earned_text'>Yearly</div>
				</div>
				<div className='center-line'></div>
				<div className='center-info-details'>
					<div className='main_right_header_info_earned_number'>
						${' '}
						{new Intl.NumberFormat('en-US').format(
							parseInt(calcEarned().interest)
						)}
					</div>
					<div className='main_right_header_info_earned_text'>Term</div>
				</div>
			</>
		);
	}

	function CustomTooltip({ payload, label, active }) {
		const numericValue = parseFloat(deposit.replace(/,/g, ''));

		if (active) {
			return (
				<div className='custom-tooltip'>
					<p className='label'>{`${payload[0].payload.title} - ${
						label + 1
					}`}</p>
					<p className='intro'>{`Interest - $${new Intl.NumberFormat(
						'en-US'
					).format(
						Number(payload[0].payload.value - numericValue).toFixed(0)
					)}`}</p>
					<p className='desc'>{`Total - $${new Intl.NumberFormat(
						'en-US'
					).format(Number(payload[0].payload.value).toFixed(0))}`}</p>
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
										setDeposit('50,000');
									} else {
										setAccTypes(e);
										setDeposit('100,000');
									}
								}}
								onClean={() => {
									setAccTypes('Orbit');
								}}
							/>
						</div>
						<div>
							<label>Deposit Amount</label>
							<InputGroup>
								<InputGroup.Addon>$</InputGroup.Addon>
								<Input
									className='input-group'
									defaultValue={
										typeof deposit === 'string'
											? deposit
											: new Intl.NumberFormat('en-US').format(deposit)
									}
									min={accTypes === 'Orbit' ? '50,000' : '100,000'}
									value={
										typeof deposit === 'string'
											? deposit
											: new Intl.NumberFormat('en-US').format(deposit)
									}
									onChange={e => {
										if (e === '') {
											setDeposit(new Intl.NumberFormat('en-US').format(0));
										} else {
											const numericValue = parseFloat(e.replace(/,/g, ''));

											setDeposit(
												new Intl.NumberFormat('en-US').format(numericValue)
											);
										}
									}}
								/>
							</InputGroup>
							{/* <InputNumber
								prefix='$'
								className='input-group'
								defaultValue={parseInt(deposit)}
								min={accTypes === 'Orbit' ? 50000 : 100000}
								value={+deposit}
								onChange={e => {
									setDeposit(e);
								}}
							/> */}
						</div>
						<div>
							<label>Term Length</label>
							<SelectPicker
								data={terms}
								searchable={false}
								defaultValue={termState}
								style={{ width: '100%' }}
								className='input-group'
								onChange={e => {
									setTermState(e);
								}}
								onClean={e => {
									setTermState('5');
								}}
							/>
						</div>
						<div className='main_left_form_apy'>
							<label>APY</label>
							<p>{calcApy()}%</p>
						</div>
						<div>
							<label>Interest Distribution Schedule</label>
							<SelectPicker
								data={interests}
								searchable={false}
								defaultValue={interestState}
								style={{ width: '100%', opacity: 0.9 }}
								className='input-group'
								onChange={e => {
									setInterestState(e);
								}}
								onClean={() => {
									setInterestState('Monthly');
								}}
							/>
						</div>
					</form>
				</div>
				<div className='center'>
					<div className='center_line'></div>
				</div>
				<div className='center-info'>
					<GenerateCenterInfo />
				</div>
				<div className='center'>
					<div className='center_line'></div>
				</div>
				<div className='main_right'>
					<div className='main_right_header_info'>
						<div className='main_right_header_info_earned'>
							<div className='main_right_header_info_earned_number'>{`$ ${new Intl.NumberFormat(
								'en-US'
							).format(calcEarned().interest)}`}</div>
							<div className='main_right_header_info_earned_text'>
								Total Interest Earned
							</div>
						</div>
						<div className='main_right_header_info_balance'>
							<div className='main_right_header_info_balance_number'>{`$ ${new Intl.NumberFormat(
								'en-US'
							).format(calcEarned().totalAmount)}`}</div>
							<div className='main_right_header_info_balance_text'>
								Total Balance
							</div>
						</div>
					</div>
					<div className='middle'>
						<div className='middle_line'></div>
					</div>
					<div className='main_right_stats-wrapper'>
						<div className='main_right_stats'>
							<ResponsiveContainer>
								<LineChart width={500} height={225} data={dataPoints}>
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
										<filter
											id='glow'
											x='-50%'
											y='-80%'
											width='300%'
											height='300%'
										>
											<feGaussianBlur result='blur' stdDeviation='4' />
											<feMerge>
												<feMergeNode in='blur' />
												<feMergeNode in='SourceGraphic' />
											</feMerge>
										</filter>
									</defs>
								</LineChart>
							</ResponsiveContainer>
						</div>
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
