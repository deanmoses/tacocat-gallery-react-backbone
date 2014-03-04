/** @jsx React.DOM */

var RootAlbumPage = React.createClass({
	render: function() {
		var a = this.props.album.attributes;
		return (
			<div>
				<HeaderTitle title={a.fulltitle} />
				<AlbumDescription description={a.description}/>
				<FirstsAndThumbs album={this.props.album}/>
			</div>
		);
	}
});


var YearAlbumPage = React.createClass({
	render: function() {
		var a = this.props.album.attributes;
		return (
			<div>
				<HeaderTitle href={a.parentAlbumPath} title={a.fulltitle} />
				<HeaderButtons>
					<UpButton href={a.parentAlbumPath} title={a.parentAlbumPath} />
				</HeaderButtons>
				<AlbumDescription description={a.description}/>
				<FirstsAndThumbs album={this.props.album}/>
			</div>
		);
	}
});


var WeekAlbumPage = React.createClass({
	render: function() {
		var a = this.props.album.attributes;
		return (
			<div>
				<HeaderTitle href={a.parentAlbumPath} title={a.fulltitle} />
				<HeaderButtons>
					<UpButton href={a.parentAlbumPath} title={a.parentAlbumPath} />
				</HeaderButtons>
				<AlbumDescription description={a.description}/>
				<FirstsAndThumbs album={this.props.album}/>
			</div>
		);
	}
});


var PhotoPage = React.createClass({
	render: function() {
		var parentAlbumPath = "/path/to/album";
		var fulltitle = "Some Photo Title";
		return (
			<div>
				<HeaderTitle title={fulltitle} />
				<HeaderButtons>
					<li><a className="btn">caption</a></li>
	<li><a className="btn" target="edit" href="http://tacocat.com/pictures/main.php?g2_view=core.ItemAdmin&g2_subView=core.ItemEdit&g2_itemId={{photo.id}}">edit</a></li>
					<div className="btn-group">
						<PrevButton href={this.props.prevPhoto} />
						<UpButton href={parentAlbumPath} title={parentAlbumPath} />
						<NextButton href={this.props.nextPhoto} />
					</div>
				</HeaderButtons>
				<PhotoPageBody />
			</div>
		);
	}
});


var PhotoPageBody = React.createClass({
	render: function() {
		var description = "PHOTO DESCRIPTION GOES HERE";
		return (
			<div className="container-fluid photo-body">
				<section className="col-md-3">
					<h2 className="hidden">Caption</h2>
				    <span className="caption">{description}</span>
				</section>
				<section className="col-md-9">
					<h2 className="hidden">Photo</h2>
					<img src="{{photo.fullSizeImage.url}}" style="width: 100%; max-width: {{photo.width}}px; max-height: {{photo.height}}px" />
				</section>
			</div>
		);
	}
});



//
// Generic Bootstrap Components
// These just wrap stuff in Bootstrap HTML and classes
//

var HeaderTitle = React.createClass({
	render: function() {
		return (
			<nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
				<div className="navbar-header">
					<a href={this.props.href} className="navbar-brand">
						{this.props.title}
					</a>
				</div>
			</nav>
		);
	}
});

var HeaderButtons = React.createClass({
	render: function() {
		return (
			<ul className="nav navbar-nav navbar-right">{this.props.children}</ul>
		);
	}
});

var HeaderButton = React.createClass({
	render: function() {
		return(
			<li><a href={this.props.href} className="button">{this.props.children}</a></li>
		);
	}
});


var UpButton = React.createClass({
	render: function() {
		return(
			<HeaderButton href={this.props.href}>
				<UpIcon/> {this.props.title}
			</HeaderButton>
		);
	}
});


var UpIcon = React.createClass({
	render: function() {
		return(
			<GlyphIcon glyph="home"/>
		);
	}
});


var GlyphIcon = React.createClass({
	render: function() {
		return(
			<span className={'glyphicon glyphicon-' + this.props.glyph}/>
		);
	}
});


var PrevButton = React.createClass({
	render: function() {
		return(
			<Button href={this.props.href}><GlyphIcon glyph="chevron-left"/> Prev</Button>
		);
	}
});

var NextButton = React.createClass({
	render: function() {
		return(
			<Button href={this.props.href}>Next <GlyphIcon glyph="chevron-right"/></Button>
		);
	}
});

var Button = React.createClass({
	render: function() {
		return(
			<a className="btn btn-default" href={this.props.href}>{this.props.children}</a>
		);
	}
});

var AlbumDescription = React.createClass({
	render: function() {
		return (
			<section className="caption container">
				<h1 className="hidden">Overview</h1>
				{this.props.description}
			</section>
		);
	}
});

var FirstsAndThumbs = React.createClass({
	var a = this.props.album.attributes;
	render: function() {
		return (
			<div className="container">
				<section className="firsts">
					FIRSTS GO HERE
				</section>
				<section className="thumbnails">
					<h1 className="hidden">Pictures</h1>
					THUMBS GO HERE
				</section>
			</div>
		);
	}
});

var Thumbnails = React.createClass({
    render: function () {    
        var thumbs = this.props.children.map(function (child) {
            return <Thumbnail item={child} />;
        });

        return (
        	<div>{thumbs}</div>
        );
    }
});


var Thumbnail = React.createClass({
	render: function() {
		var width = width + 'px';
		return(
			<span className="thumbnail">
				<a href={url}>
					<img src={url} width={width} height={height} alt={title}/>
				</a>
				<a href={url}>
					<span className="thumb-caption" style={'width:'+width}>{title}</span>
				</a>
				<p style={'width:'+width}>{summary}</p>
			</span>
		);
	}
});














