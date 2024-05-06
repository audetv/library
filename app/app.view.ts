namespace $.$$ {

	const Words = $mol_regexp.repeat_greedy( $mol_regexp.unicode_only( 'Alphabetic' ), 1 )

	export class $audetv_library_app extends $.$audetv_library_app {

		@$mol_memo.field
		get $() {
			const Base = super.$.$mol_state_arg
			return super.$.$mol_ambient( {
				$mol_state_arg: class extends Base {
					static separator = ';'
					static href = Base.href.bind( Base )
				}
			} )
		}

		query( next?: string ) {
			return this.$.$mol_state_arg.value( 'query', next ) ?? ''
		}

		where( next?: string ) {
			return this.$.$mol_state_arg.value( 'where', next ) ?? 'anywhere'
		}

		sideview( next?: string ) {
			return this.$.$mol_state_arg.value( 'sideview', next ) ?? ''
		}

		@$mol_mem
		exact( next?: boolean ) {
			const arg = next === undefined ? undefined : next ? '' : null
			return this.$.$mol_state_arg.value( 'exact', arg ) !== null
		}

		@$mol_mem
		exclude( next?: readonly string[] ) {
			const str = this.$.$mol_state_arg.value( 'exclude', next && next.join( ' ' ) ) ?? ''

			return str.split( ' ' ).filter( Boolean ) as readonly string[]
		}

		@$mol_mem
		query_backend() {

			const query = this.query_results().trim()
			if( !query ) return ''

			return [
				this.query_where(),
				this.exact() ? `"${ query }"` : query,
				this.query_exclude(),
				this.query_forbidden(),
			].join( ' ' )

		}

		@$mol_mem
		query_forbidden() {
			console.log( this.blacklist()
				.split( $mol_regexp.line_end )
				.filter( Boolean )
				.join( ' ' ) );
			
			return this.blacklist()
				.split( $mol_regexp.line_end )
				.filter( Boolean )
				.map( domain => `@author !"${ domain }"`)
				.join( ' ' )
		}

		@$mol_mem
		query_where() {

			const where = this.where()
			if( where === 'anywhere' ) return ''

			return `${ where }:`
		}

		@$mol_mem
		query_exclude() {
			return this.exclude().map( word => '-' + word ).join( ' ' )
		}

		@$mol_mem
		query_dump() {
			return this.query_backend()
				.split( /\s+/g )
				.filter( a => a.trim() )
				.join( '\n' )
		}

		blacklist( next?: string ) {
			return this.$.$mol_state_local.value( 'blacklist', next ) ?? super.blacklist()
		}

		searchers( next?: string ) {
			return this.$.$mol_state_local.value( 'searchers', next ) ?? super.searchers()
		}

		@$mol_mem
		settings( next?: boolean ) {
			const str = next == undefined ? undefined : String( next )
			return this.$.$mol_state_arg.value( 'settings', str ) !== null
		}

		@$mol_mem
		pages() {
			return [
				this.Main(),
				... this.settings() ? [ this.Settings() ] : [],
				... this.sideview() ? [ this.Sideview( this.sideview() ) ] : [],
			]
		}

		title() {
			return `${ super.title() } | библиотека`
		}

		@$mol_mem
		main_content() {
			if( !this.query_backend() ) return []
			return super.main_content()
		}

		@$mol_mem
		error() {
			return this.$.$hyoo_search_api.error()
		}

		@$mol_mem
		api() {

			return $mol_wire_sync( this.$.$audetv_library_transport )
		}

		@$mol_mem
		results_raw() {
			// console.log( this.api().search( this.query_backend() ).hits.hits );

			return this.api().search( this.query_backend() ).hits?.hits ?? []
		}

		@$mol_mem
		query_results( next?: string ): string {
			this.Main().body_scroll_top( 0 )
			return next ?? $mol_wire_probe( () => this.query_results() ) ?? this.query()
		}

		@$mol_action
		submit() {
			this.query_results( this.query() )
		}

		@$mol_mem
		result_list() {
			return this.results_raw().map( ( _:any, i:number ) => this.Result_item( i ) )
		}

		@$mol_mem_key
		result_image( index: number ) {
			const res = this.results_raw()[ index ]
			return res.thumbnailImage?.url ?? this.result_icon( index )
		}

		@$mol_mem_key
		result_icon( index: number ) {
			const res = this.results_raw()[ index ]
			return `https://favicon.yandex.net/favicon/${ res.visibleUrl }?color=0,0,0,0&size=32&stub=1`
		}

		@$mol_mem_key
		result_main( index: number ) {
			return [				
				// this.Result_host( index ),
				... this.result_descr( index ) ? [ this.Result_descr( index ) ] : [],
				this.Result_title( index ),
				this.Result_genre( index),
			]
		}

		@$mol_mem_key
		result_title( index: number ) {
			const author = this.results_raw()[ index ][ '_source' ].author
			const genre = this.results_raw()[ index ][ '_source' ].genre
			const title = this.results_raw()[ index ][ '_source' ].title
			// console.log(this.results_raw()[ index ][ '_source' ].genre)
			return author + " — " + title
		}

		@$mol_mem_key
		result_descr( index: number ) {			
			const descr = this.results_raw()[ index ][ 'highlight' ].text[0] ??
			this.results_raw()[index][ '_source'].text
			return this.result_title( index ) === descr ? '' : descr
		}

		@$mol_mem_key
		result_genre( index: number) {
			const genre = this.results_raw()[ index ][ '_source' ].genre ?? ''
			return genre
		}

		result_host( index: number ) {
			return this.results_raw()[ index ][ '_source' ].title ?? ''
		}

		@$mol_mem_key
		result_words( index: number ) {

			const stats = new Map<string, number>()
			const text = this.result_title( index ) + ' ' + this.result_descr( index )

			for( let word of text.match( Words ) ?? [] ) {

				if( word.length < 3 ) continue

				word = word.toLowerCase()
				stats.set( word, ( stats.get( word ) ?? 0 ) + 1 )

			}

			return stats
		}

		@$mol_mem
		words() {

			const total = new Map<string, number>()
			const results = this.results_raw()

			for( let i = 0; i < results.length; ++i ) {

				const stat = this.result_words( i )

				for( const [ word, count ] of stat ) {
					total.set( word, ( total.get( word ) ?? 0 ) + count )
				}

			}

			return total
		}

		@$mol_mem
		exclude_options() {
			const words = this.words()
			const all = [ ...words.keys() ]
			all.sort( ( a, b ) => words.get( b )! - words.get( a )! )
			return all as readonly string[]
		}

		exclude_badge_title( value: string ) {
			return '-' +  value 
		}

		@$mol_mem_key
		result_ban_options( index: number ) {
			const names = this.result_host( index ).split( '.' )
			return names.slice( 0, -1 ).map( ( _: any, i: number ) => names.slice( i ).join( '.' ) )
		}

		result_ban( index: number, host?: string ) {
			if( host ) this.blacklist( this.blacklist() + '\n' + host )
			return ''
		}

		@$mol_mem_key
		result_uri( index: number ) {
			const res = this.results_raw()[ index ]
			if( res.url ) return new URL( res.url ).searchParams.get( 'q' )!
			return res.contextUrl!
		}

		@$mol_mem_key
		result_embed( index: number ) {
			const res = this.results_raw()[ index ]
			if( res.url ) return new URL( res.url ).searchParams.get( 'q' )!
			return res.image!.url
		}

		@$mol_mem_key
		result_uri_view( index: number ) {
			const uri = this.result_uri( index )
			try {
				return decodeURI( uri )
			} catch( error: any ) {
				return uri
			}
		}

		@$mol_mem
		searcher_list() {
			return this.searchers().split( '\n' ).filter( Boolean ).map( uri => uri.trim() )
		}

		@$mol_mem
		searcher_links() {
			return this.searcher_list().map( ( _, i ) => this.Searcher_link( i ) )
		}

		@$mol_mem_key
		searcher_link( index: number ) {
			return this.searcher_list()[ index ] + encodeURIComponent( this.query_results() )
		}

	}

}
