const React = require('react');

function Result(props) {
	if (props.error)
		return (
			<div className="row mt-3">
				<div className="col alert alert-danger">
					{props.error}
				</div>
			</div>
		);
	if (props.ohlcv) {
		if (!props.ohlcv.length)
			return (
				<div className="row mt-3">
					<div className="col alert alert-warning">
						Нет данных
					</div>
				</div>
			);
		let rows = props.ohlcv.map(ohlcv => {
			let className = ohlcv.selected ? 'table-success' : '';
			return <tr key={ohlcv.datetime} className={className}>
				<td>{ohlcv.datetime}</td>
				<td>{ohlcv.open}</td>
				<td>{ohlcv.high}</td>
				<td>{ohlcv.low}</td>
				<td>{ohlcv.close}</td>
				<td>{ohlcv.volume}</td>
			</tr>;
		});
		return (
			<table className="table table-striped mt-3">
				<tr className="table-primary">
					<th style={{width: '20%'}}>Дата + время</th>
					<th style={{width: '15%'}}>Открытие</th>
					<th style={{width: '15%'}}>Максимум</th>
					<th style={{width: '15%'}}>Минимум</th>
					<th style={{width: '15%'}}>Закрытие</th>
					<th style={{width: '20%'}}>Объем</th>
				</tr>
				{rows}
			</table>
		);
	}
	return '';
}

function Select(props) {
	let selected = '';
	let options = props.options.map(current => {
		if (current.selected)
			selected = current.value;
		return <option value={current.value} key={current.value}>{current.text}</option>
	});
	return (
		<select className="form-select" name={props.name} defaultValue={selected} required>
			{options}
		</select>
	);
}

class Index extends React.Component {
	render() {
		let props = this.props;
		return (





<html lang="ru">
	<head>
		<meta charSet="utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>ForwardToThePast</title>
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
			integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossOrigin="anonymous"/>
	</head>
	<body>
		<div className="container my-3">
			<form className="row">
				<div className="col my-auto">
					<Select name="exchange" options={props.exchange}/>
				</div>
				<div className="col my-auto">
					<input className="form-control" type="text" name="symbol" placeholder="BASE/QUOTE" defaultValue={props.symbol} required/>
				</div>
				<div className="col my-auto">
					<Select name="interval" options={props.interval}/>
				</div>
				<div className="col my-auto">
					<input className="form-control" type="date" name="date" defaultValue={props.date} required/>
				</div>
				<div className="col my-auto">
					<input className="form-control" type="time" name="time" defaultValue={props.time} required/>
				</div>
				<div className="col my-auto">
					<button className="btn btn-primary" type="submit">Показать</button>
					<input type="hidden" name="show" value="1"/>
				</div>
			</form>
			<Result error={props.error} ohlcv={props.ohlcv}/>
		</div>
	</body>
</html>





		);
	}
}

module.exports = Index;
