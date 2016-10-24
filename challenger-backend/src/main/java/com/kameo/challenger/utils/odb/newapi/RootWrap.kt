package com.kameo.challenger.utils.odb.newapi

import javax.persistence.criteria.*
import kotlin.reflect.KClass
import kotlin.reflect.KMutableProperty1


class RootWrap<E> constructor(val pw: PathContext,
                              root: Root<E>,

                              arr: MutableList<() -> Predicate?>,
                              parent: PathWrap<E>? = null)

: PathWrap<E>(pw, root, arr, parent) {


    @Suppress("UNCHECKED_CAST")
    fun <F> join(sa: KMutableProperty1<E, F>): JoinWrap<F> {
        val join = (root as From<Any, E>).join<E, F>(sa.name) as Join<Any, F>
        return JoinWrap(pw, join, arr)

    }


    fun <F:Any> from(sa: KClass<F>): RootWrap<F> {
        val from=pw.criteria.from(sa.java);
        return RootWrap(pw, from, arr)
    }

}