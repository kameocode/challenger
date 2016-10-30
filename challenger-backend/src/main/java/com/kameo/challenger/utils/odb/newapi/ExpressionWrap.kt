package com.kameo.challenger.utils.odb.newapi

import javax.persistence.criteria.Expression
import javax.persistence.criteria.Selection

open class ExpressionWrap<E, G> constructor(
        val pc: PathContext<G>,
        val value: Expression<E>
) :
        ISelectExpressionProvider <E>,
        ISugarQuerySelect<G>,  //by pathSelect,
        IExpression<E, G> {

    override fun getSelection(): Selection<*> {
        return pc.defaultSelection!!.getSelection();
    }

    override fun isSingle(): Boolean {
        return pc.defaultSelection!!.isSingle();
    }

    override fun eq(expr: E): ExpressionWrap<E, G> {
        pc.add( { pc.cb.equal(this.value, expr) });
        return this;
    }

    override fun eq(expr: IExpression<E,*>): ExpressionWrap<E,G> {
        pc.add( { pc.cb.equal(this.value, expr.getExpression()) });
        return this;
    }



    val cb = pc.cb;

    override fun getDirectSelection(): ISugarQuerySelect<E> {
        return SelectWrap(value);
    }

    override fun getExpression(): Expression<E> {
        return value;
    }



}


interface IExpression<F,G> {
    fun getExpression() : Expression<F>
    infix fun eq(expr: IExpression<F,*>) : IExpression<F, G>;
    infix fun eq(expr: F): IExpression<F, G>;
}

interface  IStringExpressionWrap<G>: IExpression<String,G> {
    infix fun like(f: String): IExpression<String, G>;
    infix fun like(f: Expression<String>): IExpression<String, G>;
    fun lower(): StringExpressionWrap<G> ;
}


class StringExpressionWrap<G> constructor(
        pc: PathContext<G>,
        value: Expression<String>) : ExpressionWrap<String, G>(pc,  value), IStringExpressionWrap<G>  {

    override infix fun like(f: String): IExpression<String,G> {
        pc.add({ pc.cb.like(value, f) })
        return this;
    }
    override infix fun like(f: Expression<String>): IExpression<String,G> {
        pc.add({ pc.cb.like(value, f) })
        return this;
    }
    override fun lower(): StringExpressionWrap<G> {
        return StringExpressionWrap(pc,pc.cb.lower(value));
    }
}
